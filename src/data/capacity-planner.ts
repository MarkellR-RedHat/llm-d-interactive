// ---------------------------------------------------------------------------
// Capacity Planning Engine for the llm-d Capacity Planner
// ---------------------------------------------------------------------------

import { models, gpus } from './configurator-data'
import type { ModelSpec, GPUSpec } from './configurator-data'

// ---- Types ----------------------------------------------------------------

export interface CapacityTarget {
  modelId: string
  throughputRPS: number        // requests per second target
  p99LatencyMs: number         // p99 latency target in ms
  avgInputTokens: number       // average input tokens per request
  avgOutputTokens: number      // average output tokens per request
  concurrentUsers: number
}

export interface CloudProvider {
  id: string
  name: string
  gpuOptions: CloudGPU[]
}

export interface CloudGPU {
  gpuId: string               // references GPUSpec from configurator-data
  instanceType: string        // e.g. "p5.48xlarge"
  gpusPerInstance: number
  costPerHourUSD: number      // instance cost
}

export interface CapacityResult {
  feasible: boolean
  modelName: string
  gpuName: string
  gpuCount: number
  instanceCount: number
  instanceType: string
  gpusPerInstance: number
  enableDisaggregation: boolean
  prefillGPUs: number
  decodeGPUs: number
  tensorParallelism: number
  estimatedThroughputRPS: number
  estimatedP99LatencyMs: number
  costPerHourUSD: number
  costPerDayUSD: number
  costPerMonthUSD: number
  utilizationPercent: number
  headroomPercent: number
  notes: string[]
}

// ---- Cloud Providers ------------------------------------------------------

export const cloudProviders: CloudProvider[] = [
  {
    id: 'aws',
    name: 'AWS',
    gpuOptions: [
      {
        gpuId: 'h100',
        instanceType: 'p5.48xlarge',
        gpusPerInstance: 8,
        costPerHourUSD: 98.32,
      },
      {
        gpuId: 'a100-80gb',
        instanceType: 'p4d.24xlarge',
        gpusPerInstance: 8,
        costPerHourUSD: 32.77,
      },
    ],
  },
  {
    id: 'gcp',
    name: 'GCP',
    gpuOptions: [
      {
        gpuId: 'h100',
        instanceType: 'a3-highgpu-8g',
        gpusPerInstance: 8,
        costPerHourUSD: 98.36,
      },
      {
        gpuId: 'a100-80gb',
        instanceType: 'a2-ultragpu-8g',
        gpusPerInstance: 8,
        costPerHourUSD: 40.22,
      },
    ],
  },
  {
    id: 'azure',
    name: 'Azure',
    gpuOptions: [
      {
        gpuId: 'h100',
        instanceType: 'ND H100 v5',
        gpusPerInstance: 8,
        costPerHourUSD: 98.00,
      },
      {
        gpuId: 'a100-80gb',
        instanceType: 'ND A100 v4',
        gpusPerInstance: 8,
        costPerHourUSD: 32.77,
      },
    ],
  },
  {
    id: 'on-prem',
    name: 'On-Premises (estimate)',
    gpuOptions: [
      {
        gpuId: 'h100',
        instanceType: 'custom',
        gpusPerInstance: 8,
        costPerHourUSD: 12.00,
      },
      {
        gpuId: 'mi300x',
        instanceType: 'custom',
        gpusPerInstance: 8,
        costPerHourUSD: 10.00,
      },
    ],
  },
]

// ---- Helpers --------------------------------------------------------------

/**
 * Parse a parameter count string like "7B", "70B", "671B" into a number.
 */
function paramBillions(paramCount: string): number {
  const cleaned = paramCount.replace(/[Bb]/g, '')
  return parseFloat(cleaned)
}

/**
 * Look up a GPU spec by its id from the shared gpus array.
 */
function findGPUSpec(gpuId: string): GPUSpec | undefined {
  return gpus.find((g) => g.id === gpuId)
}

/**
 * Estimate the raw decode tokens per second for a single GPU, scaled by
 * model size and GPU capability. The baseline is ~18 tokens/sec per GPU
 * for a 70B-parameter dense model on an H100 (fp16 ~989 TFLOPS,
 * memory bandwidth ~3.35 TB/s). Smaller models run proportionally faster
 * and faster GPUs yield proportionally more throughput.
 */
function estimateTokensPerSecondPerGPU(
  model: ModelSpec,
  gpuSpec: GPUSpec,
): number {
  const params = paramBillions(model.paramCount)

  // Baseline: 70B on H100 produces roughly 18 decode tokens/sec per GPU
  const baselineParams = 70
  const baselineTokensPerSec = 18
  const baselineBandwidth = 3.35 // H100 TB/s

  // Scale inversely with model size (smaller models are faster)
  const sizeScaling = baselineParams / params

  // Scale with GPU memory bandwidth (primary bottleneck for decode)
  const bandwidthScaling = gpuSpec.memoryBandwidthTBs / baselineBandwidth

  // MoE models only activate a fraction of parameters per token, so they
  // run faster than their total parameter count would suggest. DeepSeek V3
  // and R1 activate roughly 37B out of 671B, so the effective parameter
  // count is much lower.
  const moeBoost = model.isMoE ? 2.5 : 1.0

  let tokensPerSec =
    baselineTokensPerSec * sizeScaling * bandwidthScaling * moeBoost

  // Clamp to a reasonable range per GPU
  tokensPerSec = Math.max(5, Math.min(tokensPerSec, 500))

  return tokensPerSec
}

/**
 * Estimate p99 latency in milliseconds for a request with the given token
 * counts, model, and configuration.
 *
 * The model:
 *   prefill time  ~ avgInputTokens * 0.3 ms  (compute-bound, fast per token)
 *   decode time   ~ avgOutputTokens * 2.0 ms  (memory-bandwidth-bound)
 *   base latency  = prefill + decode
 *
 * Adjustments:
 *   - Scale inversely with GPU memory bandwidth relative to H100 baseline
 *   - Disaggregation reduces latency by ~30% (pipelining prefill/decode)
 *   - Queue pressure from high concurrency adds latency
 */
function estimateP99Latency(
  avgInputTokens: number,
  avgOutputTokens: number,
  gpuSpec: GPUSpec,
  disaggregation: boolean,
  utilizationPercent: number,
): number {
  const baselineBandwidth = 3.35

  // Base latency components
  const prefillLatency = avgInputTokens * 0.3
  const decodeLatency = avgOutputTokens * 2.0
  let latency = prefillLatency + decodeLatency

  // Scale by GPU speed (faster bandwidth means lower latency)
  const speedFactor = baselineBandwidth / gpuSpec.memoryBandwidthTBs
  latency *= speedFactor

  // Disaggregation pipelining benefit
  if (disaggregation) {
    latency *= 0.7
  }

  // Queue pressure: at high utilization, p99 latency increases
  // Use a simple queuing model where latency grows as utilization rises
  if (utilizationPercent > 50) {
    const queueFactor = 1.0 + ((utilizationPercent - 50) / 50) * 0.5
    latency *= queueFactor
  }

  return Math.round(latency)
}

// ---- Main Calculation -----------------------------------------------------

export function calculateCapacity(
  target: CapacityTarget,
  providerId: string,
  gpuOptionIndex: number,
): CapacityResult {
  const notes: string[] = []

  // 1. Look up the model
  const model = models.find((m) => m.id === target.modelId)
  if (!model) {
    return buildInfeasibleResult(
      `Model "${target.modelId}" not found.`,
      target.modelId,
    )
  }

  // 2. Get the cloud GPU option from the provider
  const provider = cloudProviders.find((p) => p.id === providerId)
  if (!provider) {
    return buildInfeasibleResult(
      `Cloud provider "${providerId}" not found.`,
      model.name,
    )
  }

  if (gpuOptionIndex < 0 || gpuOptionIndex >= provider.gpuOptions.length) {
    return buildInfeasibleResult(
      `GPU option index ${gpuOptionIndex} is out of range for provider "${provider.name}".`,
      model.name,
    )
  }

  const cloudGPU = provider.gpuOptions[gpuOptionIndex]
  const gpuSpec = findGPUSpec(cloudGPU.gpuId)
  if (!gpuSpec) {
    return buildInfeasibleResult(
      `GPU spec "${cloudGPU.gpuId}" not found in hardware catalog.`,
      model.name,
    )
  }

  // 3. Tensor parallelism degree
  const tp = model.recommendedTP

  // 4. Estimate per-GPU throughput
  const tokensPerSecPerGPU = estimateTokensPerSecondPerGPU(model, gpuSpec)
  const totalTokensPerRequest = target.avgInputTokens + target.avgOutputTokens

  // A TP group processes requests together, so throughput scales with TP
  const tokensPerSecPerTPGroup = tokensPerSecPerGPU * tp
  const rpsPerTPGroup = tokensPerSecPerTPGroup / totalTokensPerRequest

  // 5. How many TP groups needed
  let tpGroupsNeeded = Math.ceil(target.throughputRPS / rpsPerTPGroup)
  tpGroupsNeeded = Math.max(1, tpGroupsNeeded)

  // 6. Total GPUs
  let totalGPUs = tpGroupsNeeded * tp

  // 7. Should we enable disaggregation?
  const params = paramBillions(model.paramCount)
  let enableDisaggregation = params > 13 && target.throughputRPS > 50

  // 8. Disaggregated GPU split
  let prefillGPUs = 0
  let decodeGPUs = 0
  if (enableDisaggregation) {
    // Need at least 2 TP groups to disaggregate
    if (totalGPUs < tp * 2) {
      totalGPUs = tp * 2
    }
    prefillGPUs = Math.max(tp, Math.ceil(totalGPUs * 0.4 / tp) * tp)
    decodeGPUs = Math.max(tp, totalGPUs - prefillGPUs)
    totalGPUs = prefillGPUs + decodeGPUs
  }

  // 9. Estimate p99 latency
  const estimatedThroughputRPS = tpGroupsNeeded * rpsPerTPGroup
  const utilization =
    (target.throughputRPS / estimatedThroughputRPS) * 100

  let estimatedP99 = estimateP99Latency(
    target.avgInputTokens,
    target.avgOutputTokens,
    gpuSpec,
    enableDisaggregation,
    utilization,
  )

  // 10. If latency target is very tight, add more GPUs to keep queues short
  if (estimatedP99 > target.p99LatencyMs && target.p99LatencyMs < 500) {
    // Add extra TP groups to reduce per-group load
    const scaleFactor = Math.ceil(estimatedP99 / target.p99LatencyMs)
    const extraGroups = Math.max(1, tpGroupsNeeded * (scaleFactor - 1))
    tpGroupsNeeded += extraGroups
    totalGPUs = tpGroupsNeeded * tp

    if (enableDisaggregation) {
      prefillGPUs = Math.max(tp, Math.ceil(totalGPUs * 0.4 / tp) * tp)
      decodeGPUs = Math.max(tp, totalGPUs - prefillGPUs)
      totalGPUs = prefillGPUs + decodeGPUs
    }

    // Recalculate after adding GPUs
    const newEstimatedThroughput = tpGroupsNeeded * rpsPerTPGroup
    const newUtilization =
      (target.throughputRPS / newEstimatedThroughput) * 100

    estimatedP99 = estimateP99Latency(
      target.avgInputTokens,
      target.avgOutputTokens,
      gpuSpec,
      enableDisaggregation,
      newUtilization,
    )

    notes.push(
      `Added extra GPU capacity to meet tight latency target of ${target.p99LatencyMs}ms.`,
    )
  }

  // 11. Calculate costs from instance pricing
  const gpusPerInstance = cloudGPU.gpusPerInstance
  const instanceCount = Math.ceil(totalGPUs / gpusPerInstance)
  const costPerHour =
    Math.round(instanceCount * cloudGPU.costPerHourUSD * 100) / 100
  const costPerDay = Math.round(costPerHour * 24 * 100) / 100
  const costPerMonth = Math.round(costPerHour * 24 * 30 * 100) / 100

  // Recalculate final throughput and utilization based on actual GPU count
  const actualGPUs = instanceCount * gpusPerInstance
  const actualTPGroups = Math.floor(actualGPUs / tp)
  const actualThroughput =
    Math.round(actualTPGroups * rpsPerTPGroup * 100) / 100
  const actualUtilization =
    Math.round((target.throughputRPS / actualThroughput) * 10000) / 100
  const headroom = Math.round((100 - actualUtilization) * 100) / 100

  // Recalculate latency with actual utilization
  const finalP99 = estimateP99Latency(
    target.avgInputTokens,
    target.avgOutputTokens,
    gpuSpec,
    enableDisaggregation,
    actualUtilization,
  )

  // Check feasibility
  const feasible = actualThroughput >= target.throughputRPS

  // 12. Generate notes
  if (enableDisaggregation) {
    notes.push(
      `Disaggregated serving enabled: ${prefillGPUs} GPUs for prefill, ${decodeGPUs} GPUs for decode. This separates prompt processing from token generation for better resource utilization.`,
    )
  }

  if (model.isMoE) {
    notes.push(
      `${model.name} is a Mixture-of-Experts model. Only a fraction of parameters are active per token, which improves throughput relative to a dense model of the same total size. Ensure adequate inter-node bandwidth for expert routing.`,
    )
  }

  if (headroom < 20) {
    notes.push(
      `Headroom is only ${headroom}%. Consider provisioning additional capacity to handle traffic spikes and avoid queuing delays.`,
    )
  } else if (headroom > 60) {
    notes.push(
      `Headroom is ${headroom}%. You could reduce instance count to save costs, unless you expect significant traffic growth.`,
    )
  }

  if (params > 13 && !enableDisaggregation) {
    notes.push(
      'Consider enabling disaggregated serving (raise throughput target above 50 RPS) to improve time-to-first-token latency for this model size.',
    )
  }

  if (finalP99 > target.p99LatencyMs) {
    notes.push(
      `Estimated p99 latency (${finalP99}ms) exceeds the target (${target.p99LatencyMs}ms). Consider reducing output token count, using a faster GPU, or adding more instances.`,
    )
  }

  if (gpuSpec.vendor === 'AMD') {
    notes.push(
      'AMD MI300X requires the ROCm build of vLLM. Use the vllm/vllm-openai:latest-rocm image tag.',
    )
  }

  if (params >= 100 && tp >= 8) {
    notes.push(
      'This model requires multi-node serving. Ensure your cluster has high-bandwidth interconnects (InfiniBand or RoCE) for efficient tensor parallelism across nodes.',
    )
  }

  if (target.concurrentUsers > actualTPGroups * 10) {
    notes.push(
      `High concurrency (${target.concurrentUsers} users) relative to serving capacity. Consider using request queuing and flow control in the EPP configuration.`,
    )
  }

  return {
    feasible,
    modelName: model.name,
    gpuName: gpuSpec.name,
    gpuCount: actualGPUs,
    instanceCount,
    instanceType: cloudGPU.instanceType,
    gpusPerInstance,
    enableDisaggregation,
    prefillGPUs: enableDisaggregation ? prefillGPUs : 0,
    decodeGPUs: enableDisaggregation ? decodeGPUs : 0,
    tensorParallelism: tp,
    estimatedThroughputRPS: actualThroughput,
    estimatedP99LatencyMs: finalP99,
    costPerHourUSD: costPerHour,
    costPerDayUSD: costPerDay,
    costPerMonthUSD: costPerMonth,
    utilizationPercent: actualUtilization,
    headroomPercent: headroom,
    notes,
  }
}

// ---- What-If Recalculation ------------------------------------------------

export function calculateWhatIf(
  baseResult: CapacityResult,
  target: CapacityTarget,
  adjustedLatencyMs: number,
  adjustedThroughputRPS: number,
  providerId: string,
  gpuOptionIndex: number,
): CapacityResult {
  // Recalculate with the adjusted targets
  const adjustedTarget: CapacityTarget = {
    ...target,
    throughputRPS: adjustedThroughputRPS,
    p99LatencyMs: adjustedLatencyMs,
  }

  const result = calculateCapacity(adjustedTarget, providerId, gpuOptionIndex)

  // Add a note comparing to the baseline
  const costDelta = result.costPerMonthUSD - baseResult.costPerMonthUSD
  const gpuDelta = result.gpuCount - baseResult.gpuCount

  if (costDelta !== 0 || gpuDelta !== 0) {
    const costDirection = costDelta > 0 ? 'increase' : 'decrease'
    const gpuDirection = gpuDelta > 0 ? 'more' : 'fewer'

    result.notes.push(
      `Compared to baseline: ${Math.abs(gpuDelta)} ${gpuDirection} GPUs, ` +
      `cost ${costDirection} of $${Math.abs(costDelta).toLocaleString()}/month.`,
    )
  }

  return result
}

// ---- Infeasible Result Helper ---------------------------------------------

function buildInfeasibleResult(
  reason: string,
  modelName: string,
): CapacityResult {
  return {
    feasible: false,
    modelName,
    gpuName: 'N/A',
    gpuCount: 0,
    instanceCount: 0,
    instanceType: 'N/A',
    gpusPerInstance: 0,
    enableDisaggregation: false,
    prefillGPUs: 0,
    decodeGPUs: 0,
    tensorParallelism: 0,
    estimatedThroughputRPS: 0,
    estimatedP99LatencyMs: 0,
    costPerHourUSD: 0,
    costPerDayUSD: 0,
    costPerMonthUSD: 0,
    utilizationPercent: 0,
    headroomPercent: 0,
    notes: [reason],
  }
}
