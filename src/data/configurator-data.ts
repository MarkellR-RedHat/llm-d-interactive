// ---------------------------------------------------------------------------
// Data models and config generator for the llm-d Deployment Configurator
// ---------------------------------------------------------------------------

// ---- Model Specs ----------------------------------------------------------

export interface ModelSpec {
  id: string
  name: string
  paramCount: string
  family: string
  contextLength: number
  isMoE: boolean
  minGPUMemoryGB: number
  recommendedTP: number
  tags: string[]
}

export const models: ModelSpec[] = [
  {
    id: 'llama-3.1-8b',
    name: 'Llama 3.1 8B',
    paramCount: '7B',
    family: 'Llama',
    contextLength: 128_000,
    isMoE: false,
    minGPUMemoryGB: 24,
    recommendedTP: 1,
    tags: ['popular', 'efficient', 'instruction-tuned'],
  },
  {
    id: 'llama-3.1-70b',
    name: 'Llama 3.1 70B',
    paramCount: '70B',
    family: 'Llama',
    contextLength: 128_000,
    isMoE: false,
    minGPUMemoryGB: 80,
    recommendedTP: 4,
    tags: ['popular', 'high-quality', 'instruction-tuned'],
  },
  {
    id: 'llama-3.1-405b',
    name: 'Llama 3.1 405B',
    paramCount: '405B',
    family: 'Llama',
    contextLength: 128_000,
    isMoE: false,
    minGPUMemoryGB: 320,
    recommendedTP: 8,
    tags: ['frontier', 'multi-node', 'instruction-tuned'],
  },
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    paramCount: '70B',
    family: 'Llama',
    contextLength: 128_000,
    isMoE: false,
    minGPUMemoryGB: 80,
    recommendedTP: 4,
    tags: ['popular', 'latest', 'instruction-tuned'],
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    paramCount: '671B',
    family: 'DeepSeek',
    contextLength: 128_000,
    isMoE: true,
    minGPUMemoryGB: 160,
    recommendedTP: 8,
    tags: ['frontier', 'moe', 'multi-node'],
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    paramCount: '671B',
    family: 'DeepSeek',
    contextLength: 128_000,
    isMoE: true,
    minGPUMemoryGB: 160,
    recommendedTP: 8,
    tags: ['frontier', 'reasoning', 'moe', 'multi-node'],
  },
  {
    id: 'mistral-7b',
    name: 'Mistral 7B',
    paramCount: '7B',
    family: 'Mistral',
    contextLength: 32_000,
    isMoE: false,
    minGPUMemoryGB: 16,
    recommendedTP: 1,
    tags: ['efficient', 'popular'],
  },
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    paramCount: '47B',
    family: 'Mistral',
    contextLength: 32_000,
    isMoE: true,
    minGPUMemoryGB: 80,
    recommendedTP: 4,
    tags: ['moe', 'efficient', 'popular'],
  },
  {
    id: 'qwen-2.5-72b',
    name: 'Qwen 2.5 72B',
    paramCount: '72B',
    family: 'Qwen',
    contextLength: 128_000,
    isMoE: false,
    minGPUMemoryGB: 80,
    recommendedTP: 4,
    tags: ['high-quality', 'multilingual'],
  },
  {
    id: 'phi-3-mini',
    name: 'Phi-3 Mini',
    paramCount: '3.8B',
    family: 'Phi',
    contextLength: 128_000,
    isMoE: false,
    minGPUMemoryGB: 8,
    recommendedTP: 1,
    tags: ['compact', 'efficient', 'edge'],
  },
]

// ---- GPU Specs ------------------------------------------------------------

export interface GPUSpec {
  id: string
  name: string
  vendor: string
  memoryGB: number
  memoryBandwidthTBs: number
  fp16TFLOPS: number
  costPerHourUSD: number
}

export const gpus: GPUSpec[] = [
  {
    id: 'h100',
    name: 'NVIDIA H100 SXM',
    vendor: 'NVIDIA',
    memoryGB: 80,
    memoryBandwidthTBs: 3.35,
    fp16TFLOPS: 989,
    costPerHourUSD: 3.5,
  },
  {
    id: 'h200',
    name: 'NVIDIA H200 SXM',
    vendor: 'NVIDIA',
    memoryGB: 141,
    memoryBandwidthTBs: 4.8,
    fp16TFLOPS: 989,
    costPerHourUSD: 4.5,
  },
  {
    id: 'b200',
    name: 'NVIDIA B200',
    vendor: 'NVIDIA',
    memoryGB: 192,
    memoryBandwidthTBs: 8.0,
    fp16TFLOPS: 2250,
    costPerHourUSD: 6.0,
  },
  {
    id: 'a100-80gb',
    name: 'NVIDIA A100 80GB',
    vendor: 'NVIDIA',
    memoryGB: 80,
    memoryBandwidthTBs: 2.0,
    fp16TFLOPS: 312,
    costPerHourUSD: 2.5,
  },
  {
    id: 'mi300x',
    name: 'AMD Instinct MI300X',
    vendor: 'AMD',
    memoryGB: 192,
    memoryBandwidthTBs: 5.3,
    fp16TFLOPS: 1300,
    costPerHourUSD: 3.8,
  },
]

// ---- Workload Profiles ----------------------------------------------------

export interface WorkloadProfile {
  id: string
  name: string
  description: string
  avgInputTokens: number
  avgOutputTokens: number
  targetTTFTms: number
  targetITLms: number
  concurrentUsers: number
  burstFactor: number
}

export const workloadProfiles: WorkloadProfile[] = [
  {
    id: 'interactive-chat',
    name: 'Interactive Chat',
    description:
      'Real-time conversational workload with short prompts and fast response expectations.',
    avgInputTokens: 512,
    avgOutputTokens: 256,
    targetTTFTms: 500,
    targetITLms: 50,
    concurrentUsers: 50,
    burstFactor: 1.5,
  },
  {
    id: 'batch-processing',
    name: 'Batch Processing',
    description:
      'High-throughput offline workload prioritizing total tokens per second over latency.',
    avgInputTokens: 2000,
    avgOutputTokens: 1000,
    targetTTFTms: 5000,
    targetITLms: 100,
    concurrentUsers: 200,
    burstFactor: 1.0,
  },
  {
    id: 'rag-retrieval',
    name: 'RAG/Retrieval',
    description:
      'Long-context retrieval-augmented generation with large input contexts and concise outputs.',
    avgInputTokens: 4000,
    avgOutputTokens: 512,
    targetTTFTms: 1000,
    targetITLms: 50,
    concurrentUsers: 100,
    burstFactor: 2.0,
  },
  {
    id: 'code-generation',
    name: 'Code Generation',
    description:
      'Code completion and generation workload with moderate inputs and long outputs.',
    avgInputTokens: 1000,
    avgOutputTokens: 2000,
    targetTTFTms: 1000,
    targetITLms: 30,
    concurrentUsers: 30,
    burstFactor: 1.2,
  },
  {
    id: 'agentic',
    name: 'Agentic',
    description:
      'Multi-turn agent workflows with bursty traffic and low-latency requirements.',
    avgInputTokens: 2000,
    avgOutputTokens: 1000,
    targetTTFTms: 500,
    targetITLms: 50,
    concurrentUsers: 50,
    burstFactor: 3.0,
  },
]

// ---- Generated Config Output ----------------------------------------------

export interface GeneratedConfig {
  helmValues: string
  eppConfig: string
  routingPolicy: string
  disaggregation: boolean
  estimatedGPUCount: number
  estimatedPrefillGPUs: number
  estimatedDecodeGPUs: number
  estimatedCostPerHour: number
  notes: string[]
}

// ---- Helpers --------------------------------------------------------------

function paramBillions(paramCount: string): number {
  const cleaned = paramCount.replace(/[Bb]/g, '')
  return parseFloat(cleaned)
}

function modelImagePath(model: ModelSpec): string {
  const familyMap: Record<string, string> = {
    Llama: 'meta-llama',
    DeepSeek: 'deepseek-ai',
    Mistral: 'mistralai',
    Qwen: 'Qwen',
    Phi: 'microsoft',
  }
  const org = familyMap[model.family] ?? model.family.toLowerCase()
  const slug = model.name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '-')
  return `${org}/${slug}`
}

function gpusPerReplica(model: ModelSpec, gpu: GPUSpec): number {
  // Each replica needs enough GPUs for tensor parallelism and memory
  const tpGPUs = model.recommendedTP
  const memoryGPUs = Math.ceil(model.minGPUMemoryGB / gpu.memoryGB)
  return Math.max(tpGPUs, memoryGPUs)
}

// ---- Config Generator -----------------------------------------------------

export function generateConfig(
  model: ModelSpec,
  gpu: GPUSpec,
  workload: WorkloadProfile,
  enableDisaggregation: boolean,
  gpuCount: number,
): GeneratedConfig {
  const notes: string[] = []
  const gpusNeeded = gpusPerReplica(model, gpu)
  const params = paramBillions(model.paramCount)

  // Determine replica counts
  const totalReplicas = Math.max(1, Math.floor(gpuCount / gpusNeeded))

  let prefillReplicas: number
  let decodeReplicas: number

  if (enableDisaggregation && totalReplicas >= 2) {
    // Prefill-heavy workloads (RAG) get more prefill replicas
    const prefillRatio =
      workload.avgInputTokens / (workload.avgInputTokens + workload.avgOutputTokens)
    prefillReplicas = Math.max(1, Math.round(totalReplicas * prefillRatio))
    decodeReplicas = Math.max(1, totalReplicas - prefillReplicas)
  } else {
    prefillReplicas = 0
    decodeReplicas = 0
  }

  const actualDisaggregation = enableDisaggregation && totalReplicas >= 2

  // Build cost estimate
  const estimatedCost = gpuCount * gpu.costPerHourUSD

  // Determine if strict latency targets apply
  const strictLatency = workload.targetTTFTms <= 500 || workload.targetITLms <= 30
  const needsFlowControl =
    workload.id === 'agentic' || workload.id === 'batch-processing'

  // ---- Helm Values --------------------------------------------------------
  const helmValues = buildHelmValues(
    model,
    gpu,
    workload,
    actualDisaggregation,
    gpuCount,
    gpusNeeded,
    totalReplicas,
    prefillReplicas,
    decodeReplicas,
  )

  // ---- EPP Config ---------------------------------------------------------
  const eppConfig = buildEPPConfig(
    workload,
    actualDisaggregation,
    strictLatency,
    needsFlowControl,
  )

  // ---- Routing Policy Description -----------------------------------------
  const routingPolicy = buildRoutingPolicyDescription(
    workload,
    actualDisaggregation,
    strictLatency,
    needsFlowControl,
  )

  // ---- Notes --------------------------------------------------------------
  if (params > 13 && !enableDisaggregation) {
    notes.push(
      'Consider enabling disaggregation for models larger than 13B to improve time-to-first-token latency.',
    )
  }
  if (model.isMoE) {
    notes.push(
      'MoE models benefit from wide expert parallelism on multi-node setups. Ensure inter-node bandwidth supports efficient all-to-all communication.',
    )
  }
  if (gpuCount < gpusNeeded) {
    notes.push(
      `Warning: ${gpuCount} GPUs are not sufficient. This model requires at least ${gpusNeeded} ${gpu.name} GPUs per replica for tensor parallelism and memory.`,
    )
  }
  if (totalReplicas < 2 && workload.burstFactor > 1.5) {
    notes.push(
      'Bursty workloads benefit from multiple replicas. Consider adding more GPUs to allow at least 2 replicas.',
    )
  }
  if (actualDisaggregation) {
    notes.push(
      `Disaggregated serving is enabled with ${prefillReplicas} prefill and ${decodeReplicas} decode replicas. The EPP will route prefill and decode phases to specialized pools.`,
    )
  }
  if (workload.id === 'rag-retrieval' && model.contextLength < 64_000) {
    notes.push(
      'RAG workloads with large retrieval contexts benefit from models with at least 64K context length.',
    )
  }
  if (strictLatency) {
    notes.push(
      'Strict latency targets detected. The EPP latency predictor plugin is included to gate admissions when SLO targets are at risk.',
    )
  }
  if (needsFlowControl) {
    notes.push(
      'Flow control is enabled to manage request admission under high concurrency or burst scenarios.',
    )
  }
  if (gpu.vendor === 'AMD') {
    notes.push(
      'AMD MI300X support in vLLM requires the ROCm build. Use the vllm/vllm-openai:latest-rocm image tag.',
    )
  }
  if (params >= 100 && gpusNeeded > 8) {
    notes.push(
      'This configuration requires multi-node serving. Ensure your Kubernetes cluster has InfiniBand or RoCE networking for optimal cross-node tensor parallelism.',
    )
  }

  return {
    helmValues,
    eppConfig,
    routingPolicy,
    disaggregation: actualDisaggregation,
    estimatedGPUCount: gpuCount,
    estimatedPrefillGPUs: actualDisaggregation ? prefillReplicas * gpusNeeded : 0,
    estimatedDecodeGPUs: actualDisaggregation ? decodeReplicas * gpusNeeded : 0,
    estimatedCostPerHour: Math.round(estimatedCost * 100) / 100,
    notes,
  }
}

// ---- Helm Values Builder --------------------------------------------------

function buildHelmValues(
  model: ModelSpec,
  gpu: GPUSpec,
  _workload: WorkloadProfile,
  disaggregation: boolean,
  _gpuCount: number,
  gpusNeeded: number,
  totalReplicas: number,
  prefillReplicas: number,
  decodeReplicas: number,
): string {
  const modelPath = modelImagePath(model)
  const gpuResource = gpu.vendor === 'AMD' ? 'amd.com/gpu' : 'nvidia.com/gpu'
  const vllmImage =
    gpu.vendor === 'AMD'
      ? 'vllm/vllm-openai:latest-rocm'
      : 'vllm/vllm-openai:latest'

  const maxModelLen = Math.min(model.contextLength, 32768)

  if (disaggregation) {
    return buildDisaggregatedHelm(
      model,
      modelPath,
      vllmImage,
      gpuResource,
      gpusNeeded,
      prefillReplicas,
      decodeReplicas,
      maxModelLen,
    )
  }

  return buildUnifiedHelm(
    model,
    modelPath,
    vllmImage,
    gpuResource,
    gpusNeeded,
    totalReplicas,
    maxModelLen,
  )
}

function buildUnifiedHelm(
  model: ModelSpec,
  modelPath: string,
  vllmImage: string,
  gpuResource: string,
  gpusNeeded: number,
  replicas: number,
  maxModelLen: number,
): string {
  return `# llm-d Helm Values - Unified Serving
# Model: ${model.name} (${model.paramCount} parameters)

global:
  modelName: "${model.id}"
  modelPath: "${modelPath}"

modelServer:
  image: "${vllmImage}"
  replicas: ${replicas}
  args:
    - "--model"
    - "${modelPath}"
    - "--tensor-parallel-size"
    - "${model.recommendedTP}"
    - "--max-model-len"
    - "${maxModelLen}"
    - "--enable-prefix-caching"
    - "--disable-log-requests"
  resources:
    limits:
      ${gpuResource}: ${gpusNeeded}
      memory: "${Math.ceil(model.minGPUMemoryGB * 1.2)}Gi"
    requests:
      ${gpuResource}: ${gpusNeeded}
      memory: "${Math.ceil(model.minGPUMemoryGB * 0.8)}Gi"

inferencePool:
  name: "${model.id}-pool"
  targetPortNumber: 8000
  selector:
    app: "${model.id}-server"

router:
  name: "${model.id}-router"
  replicas: 2
  image: "ghcr.io/llm-d/llm-d-routing-sidecar:latest"
  eppRef:
    name: "${model.id}-epp"
    namespace: "default"

epp:
  name: "${model.id}-epp"
  replicas: 2
  image: "ghcr.io/llm-d/llm-d-inference-scheduler:latest"
  poolRef:
    name: "${model.id}-pool"
`
}

function buildDisaggregatedHelm(
  model: ModelSpec,
  modelPath: string,
  vllmImage: string,
  gpuResource: string,
  gpusNeeded: number,
  prefillReplicas: number,
  decodeReplicas: number,
  maxModelLen: number,
): string {
  return `# llm-d Helm Values - Disaggregated Prefill/Decode
# Model: ${model.name} (${model.paramCount} parameters)
# Prefill replicas: ${prefillReplicas}, Decode replicas: ${decodeReplicas}

global:
  modelName: "${model.id}"
  modelPath: "${modelPath}"
  disaggregatedServing:
    enabled: true

prefillServer:
  image: "${vllmImage}"
  replicas: ${prefillReplicas}
  args:
    - "--model"
    - "${modelPath}"
    - "--tensor-parallel-size"
    - "${model.recommendedTP}"
    - "--max-model-len"
    - "${maxModelLen}"
    - "--enable-prefix-caching"
    - "--disable-log-requests"
    - "--kv-transfer-config"
    - '{"kv_connector":"PyNcclConnector","kv_role":"kv_producer","kv_rank":0,"kv_parallel_size":2}'
  labels:
    llm-d.ai/serving-role: prefill
  resources:
    limits:
      ${gpuResource}: ${gpusNeeded}
      memory: "${Math.ceil(model.minGPUMemoryGB * 1.2)}Gi"
    requests:
      ${gpuResource}: ${gpusNeeded}
      memory: "${Math.ceil(model.minGPUMemoryGB * 0.8)}Gi"

decodeServer:
  image: "${vllmImage}"
  replicas: ${decodeReplicas}
  args:
    - "--model"
    - "${modelPath}"
    - "--tensor-parallel-size"
    - "${model.recommendedTP}"
    - "--max-model-len"
    - "${maxModelLen}"
    - "--enable-prefix-caching"
    - "--disable-log-requests"
    - "--kv-transfer-config"
    - '{"kv_connector":"PyNcclConnector","kv_role":"kv_consumer","kv_rank":1,"kv_parallel_size":2}'
  labels:
    llm-d.ai/serving-role: decode
  resources:
    limits:
      ${gpuResource}: ${gpusNeeded}
      memory: "${Math.ceil(model.minGPUMemoryGB * 1.2)}Gi"
    requests:
      ${gpuResource}: ${gpusNeeded}
      memory: "${Math.ceil(model.minGPUMemoryGB * 0.8)}Gi"

inferencePool:
  name: "${model.id}-pool"
  targetPortNumber: 8000
  selector:
    app: "${model.id}-server"

router:
  name: "${model.id}-router"
  replicas: 2
  image: "ghcr.io/llm-d/llm-d-routing-sidecar:latest"
  eppRef:
    name: "${model.id}-epp"
    namespace: "default"

epp:
  name: "${model.id}-epp"
  replicas: 2
  image: "ghcr.io/llm-d/llm-d-inference-scheduler:latest"
  poolRef:
    name: "${model.id}-pool"
`
}

// ---- EPP Config Builder ---------------------------------------------------

function buildEPPConfig(
  workload: WorkloadProfile,
  disaggregation: boolean,
  strictLatency: boolean,
  needsFlowControl: boolean,
): string {
  const pluginDefs: string[] = []
  const profilePlugins: string[] = []

  // Core plugins (always present)
  pluginDefs.push(`- type: prefix-cache-scorer`)
  pluginDefs.push(`- type: approx-prefix-cache-producer
  parameters:
    blockSizeTokens: 64
    maxPrefixBlocksToMatch: 256`)
  pluginDefs.push(`- type: kv-cache-utilization-scorer`)
  pluginDefs.push(`- type: queue-scorer`)

  // Scoring weights depend on workload
  let prefixWeight = 3.0
  let kvCacheWeight = 2.0
  let queueWeight = 2.0

  if (workload.id === 'rag-retrieval') {
    // Heavy prefix reuse for RAG
    prefixWeight = 5.0
    kvCacheWeight = 2.0
    queueWeight = 1.0
  } else if (workload.id === 'batch-processing') {
    // Throughput focused - balance load
    prefixWeight = 1.0
    kvCacheWeight = 3.0
    queueWeight = 4.0
  } else if (workload.id === 'code-generation') {
    // Low latency decode matters most
    prefixWeight = 2.0
    kvCacheWeight = 3.0
    queueWeight = 3.0
  } else if (workload.id === 'agentic') {
    // Fast response with prefix reuse across turns
    prefixWeight = 4.0
    kvCacheWeight = 2.0
    queueWeight = 3.0
  }

  profilePlugins.push(`  - pluginRef: prefix-cache-scorer
    weight: ${prefixWeight.toFixed(1)}`)
  profilePlugins.push(`  - pluginRef: kv-cache-utilization-scorer
    weight: ${kvCacheWeight.toFixed(1)}`)
  profilePlugins.push(`  - pluginRef: queue-scorer
    weight: ${queueWeight.toFixed(1)}`)

  // Optional: latency predictor
  if (strictLatency) {
    pluginDefs.push(`- type: latency-predictor
  parameters:
    targetTTFTMs: ${workload.targetTTFTms}
    targetITLMs: ${workload.targetITLms}
    admissionThreshold: 0.9`)
    profilePlugins.push(`  - pluginRef: latency-predictor
    weight: 4.0`)
  }

  // Optional: flow control
  if (needsFlowControl) {
    pluginDefs.push(`- type: flow-control
  parameters:
    maxConcurrentRequests: ${Math.ceil(workload.concurrentUsers * workload.burstFactor)}
    queueTimeoutSeconds: ${workload.id === 'batch-processing' ? 60 : 10}
    priorityLevels: 3`)
    profilePlugins.push(`  - pluginRef: flow-control
    weight: 3.0`)
  }

  // Optional: disaggregated profile handler
  if (disaggregation) {
    pluginDefs.push(`- type: disaggregated-router
  parameters:
    prefillSelector:
      llm-d.ai/serving-role: prefill
    decodeSelector:
      llm-d.ai/serving-role: decode
    kvTransferMode: nccl`)
    profilePlugins.push(`  - pluginRef: disaggregated-router
    weight: 5.0`)
  }

  const pluginSection = pluginDefs.join('\n')
  const profileSection = profilePlugins.join('\n')

  return `apiVersion: inference.networking.x-k8s.io/v1alpha1
kind: EndpointPickerConfig
plugins:
${pluginSection}
schedulingProfiles:
- name: default
  plugins:
${profileSection}
`
}

// ---- Routing Policy Description -------------------------------------------

function buildRoutingPolicyDescription(
  workload: WorkloadProfile,
  disaggregation: boolean,
  strictLatency: boolean,
  needsFlowControl: boolean,
): string {
  const parts: string[] = []

  parts.push(
    `Requests are scored using a weighted combination of prefix cache locality, KV cache utilization, and queue depth.`,
  )

  if (workload.id === 'rag-retrieval') {
    parts.push(
      `Prefix cache scoring is weighted heavily (5.0) to maximize KV cache reuse for repeated retrieval contexts.`,
    )
  } else if (workload.id === 'batch-processing') {
    parts.push(
      `Queue depth and KV cache utilization are weighted heavily to maximize throughput and distribute load evenly.`,
    )
  } else if (workload.id === 'agentic') {
    parts.push(
      `Prefix cache scoring is elevated (4.0) to exploit multi-turn context locality, with strong queue balancing (3.0) to handle burst traffic.`,
    )
  }

  if (disaggregation) {
    parts.push(
      `Disaggregated serving separates prefill and decode phases into dedicated GPU pools. The EPP routes initial prompt processing to prefill replicas and token generation to decode replicas, enabling independent scaling and optimized resource use.`,
    )
  }

  if (strictLatency) {
    parts.push(
      `A latency predictor plugin gates request admission when predicted TTFT or inter-token latency exceeds SLO targets (TTFT < ${workload.targetTTFTms}ms, ITL < ${workload.targetITLms}ms).`,
    )
  }

  if (needsFlowControl) {
    parts.push(
      `Flow control limits concurrent requests to ${Math.ceil(workload.concurrentUsers * workload.burstFactor)} and applies priority-based queuing to prevent overload.`,
    )
  }

  return parts.join(' ')
}
