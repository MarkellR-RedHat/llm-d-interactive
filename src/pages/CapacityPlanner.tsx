import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X } from 'lucide-react'
import PageTransition from '../components/shared/PageTransition'
import { cloudProviders, calculateCapacity, type CapacityTarget, type CapacityResult, type CloudGPU } from '../data/capacity-planner'
import { models } from '../data/configurator-data'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PURPLE = '#9b4d9b'
const PURPLE_DARK = '#7f317f'
const PURPLE_LIGHT = '#f3e8f3'
const BLACK = '#151515'
const GRAY_600 = '#4D4D4D'
const GRAY_400 = '#8A8D90'
const GRAY_200 = '#D2D2D2'
const GRAY_50 = '#F0F0F0'
const GREEN = '#2E7D32'
const RED = '#C62828'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function fmtNumber(value: number): string {
  return value.toLocaleString('en-US')
}

function pctChange(original: number, adjusted: number): string {
  if (original === 0) return '+0%'
  const change = ((adjusted - original) / original) * 100
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(0)}%`
}

/* ------------------------------------------------------------------ */
/*  Styled Slider                                                      */
/* ------------------------------------------------------------------ */

const sliderTrackStyle: React.CSSProperties = {
  width: '100%',
  height: '6px',
  appearance: 'none',
  WebkitAppearance: 'none',
  background: `linear-gradient(to right, ${PURPLE} 0%, ${PURPLE} var(--progress), ${GRAY_200} var(--progress), ${GRAY_200} 100%)`,
  borderRadius: '3px',
  outline: 'none',
  cursor: 'pointer',
}

function StyledSlider({
  min,
  max,
  step,
  value,
  onChange,
  label,
  displayValue,
}: {
  min: number
  max: number
  step?: number
  value: number
  onChange: (v: number) => void
  label: string
  displayValue: string
}) {
  const progress = ((value - min) / (max - min)) * 100

  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '8px',
        }}
      >
        <label
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '14px',
            color: BLACK,
          }}
        >
          {label}
        </label>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '15px',
            color: PURPLE,
          }}
        >
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step ?? 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          ...sliderTrackStyle,
          '--progress': `${progress}%`,
          accentColor: PURPLE,
        } as React.CSSProperties}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '4px',
        }}
      >
        <span style={{ fontSize: '11px', color: GRAY_400, fontFamily: 'var(--font-mono)' }}>
          {fmtNumber(min)}
        </span>
        <span style={{ fontSize: '11px', color: GRAY_400, fontFamily: 'var(--font-mono)' }}>
          {fmtNumber(max)}
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Provider Tab Bar                                                   */
/* ------------------------------------------------------------------ */

function ProviderTabs({
  providers,
  selectedProvider,
  onSelect,
}: {
  providers: typeof cloudProviders
  selectedProvider: string
  onSelect: (id: string) => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        borderBottom: `2px solid ${GRAY_200}`,
        marginBottom: '24px',
      }}
    >
      {providers.map((p) => {
        const active = p.id === selectedProvider
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            style={{
              padding: '12px 24px',
              fontFamily: 'var(--font-display)',
              fontWeight: active ? 700 : 500,
              fontSize: '15px',
              color: active ? PURPLE : GRAY_600,
              backgroundColor: active ? PURPLE_LIGHT : 'transparent',
              border: 'none',
              borderBottom: active ? `3px solid ${PURPLE}` : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '-2px',
            }}
          >
            {p.name}
          </button>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Results Card                                                       */
/* ------------------------------------------------------------------ */

function ResultsCard({ result, target, providerName }: { result: CapacityResult; target: CapacityTarget; providerName: string }) {
  const throughputMet = result.estimatedThroughputRPS >= target.throughputRPS
  const latencyMet = result.estimatedP99LatencyMs <= target.p99LatencyMs

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Summary headline */}
      <div
        style={{
          padding: '32px',
          backgroundColor: PURPLE_LIGHT,
          borderRadius: '4px',
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '28px',
            color: BLACK,
            marginBottom: '8px',
          }}
        >
          You need {result.gpuCount} GPUs across {result.instanceCount}{' '}
          {result.instanceCount === 1 ? 'instance' : 'instances'}
        </h3>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '16px',
            color: GRAY_600,
          }}
        >
          {result.instanceType} on {providerName}
        </p>
      </div>

      {/* Cost summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {[
          { label: 'Per Hour', value: fmtCurrency(result.costPerHourUSD) },
          { label: 'Per Day', value: fmtCurrency(result.costPerDayUSD) },
          { label: 'Per Month', value: fmtCurrency(result.costPerMonthUSD) },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              padding: '24px',
              backgroundColor: '#fff',
              border: `1px solid ${GRAY_200}`,
              borderRadius: '4px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '26px',
                color: PURPLE,
                marginBottom: '4px',
              }}
            >
              {item.value}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 600,
                color: GRAY_600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Topology + Performance */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Topology */}
        <div
          style={{
            padding: '24px',
            backgroundColor: '#fff',
            border: `1px solid ${GRAY_200}`,
            borderRadius: '4px',
          }}
        >
          <h4
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '16px',
              color: BLACK,
              marginBottom: '16px',
            }}
          >
            Topology
          </h4>
          <div style={{ fontSize: '14px', lineHeight: '28px', color: GRAY_600 }}>
            <div>
              <strong>GPU Count:</strong> {result.gpuCount}
            </div>
            <div>
              <strong>Tensor Parallelism:</strong> {result.tensorParallelism}
            </div>
            <div>
              <strong>Disaggregation:</strong>{' '}
              {result.enableDisaggregation ? (
                <span style={{ color: GREEN }}>
                  Yes (Prefill: {result.prefillGPUs}, Decode: {result.decodeGPUs})
                </span>
              ) : (
                'No'
              )}
            </div>
          </div>
        </div>

        {/* Performance vs Targets */}
        <div
          style={{
            padding: '24px',
            backgroundColor: '#fff',
            border: `1px solid ${GRAY_200}`,
            borderRadius: '4px',
          }}
        >
          <h4
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '16px',
              color: BLACK,
              marginBottom: '16px',
            }}
          >
            Performance vs Targets
          </h4>
          <div style={{ fontSize: '14px', lineHeight: '28px', color: GRAY_600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {throughputMet ? (
                <Check size={16} style={{ color: GREEN, flexShrink: 0 }} />
              ) : (
                <X size={16} style={{ color: RED, flexShrink: 0 }} />
              )}
              <span>
                <strong>Throughput:</strong> {result.estimatedThroughputRPS.toFixed(1)} req/s
                (target: {target.throughputRPS} req/s)
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {latencyMet ? (
                <Check size={16} style={{ color: GREEN, flexShrink: 0 }} />
              ) : (
                <X size={16} style={{ color: RED, flexShrink: 0 }} />
              )}
              <span>
                <strong>P99 Latency:</strong> {fmtNumber(result.estimatedP99LatencyMs)} ms
                (target: {fmtNumber(target.p99LatencyMs)} ms)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Utilization */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <UtilizationBar label="GPU Utilization" value={result.utilizationPercent} />
        <UtilizationBar label="Headroom" value={result.headroomPercent} />
      </div>

      {/* Notes / Recommendations */}
      {result.notes.length > 0 && (
        <div
          style={{
            padding: '24px',
            backgroundColor: GRAY_50,
            borderRadius: '4px',
          }}
        >
          <h4
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '16px',
              color: BLACK,
              marginBottom: '12px',
            }}
          >
            Recommendations
          </h4>
          <ul
            style={{
              listStyle: 'disc',
              paddingLeft: '20px',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              lineHeight: '24px',
              color: GRAY_600,
              margin: 0,
            }}
          >
            {result.notes.map((note, i) => (
              <li key={i} style={{ marginBottom: '6px' }}>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Utilization Bar                                                    */
/* ------------------------------------------------------------------ */

function UtilizationBar({ label, value }: { label: string; value: number }) {
  const capped = Math.min(100, Math.max(0, value))
  const barColor = capped > 90 ? RED : capped > 70 ? '#F9A825' : GREEN

  return (
    <div
      style={{
        padding: '20px 24px',
        backgroundColor: '#fff',
        border: `1px solid ${GRAY_200}`,
        borderRadius: '4px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '8px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '14px',
            color: BLACK,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '16px',
            color: barColor,
          }}
        >
          {capped.toFixed(1)}%
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: GRAY_200,
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${capped}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            height: '100%',
            backgroundColor: barColor,
            borderRadius: '4px',
          }}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  "What If" Section                                                  */
/* ------------------------------------------------------------------ */

function WhatIfSection({
  originalResult,
  adjustedResult,
  latencyTarget,
  onLatencyChange,
  throughputTarget,
  onThroughputChange,
  originalLatency,
  originalThroughput,
}: {
  originalResult: CapacityResult
  adjustedResult: CapacityResult
  latencyTarget: number
  onLatencyChange: (v: number) => void
  throughputTarget: number
  onThroughputChange: (v: number) => void
  originalLatency: number
  originalThroughput: number
}) {
  const costOriginal = originalResult.costPerMonthUSD
  const costAdjusted = adjustedResult.costPerMonthUSD
  const costDelta = pctChange(costOriginal, costAdjusted)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
      style={{
        marginTop: '48px',
        padding: '32px',
        backgroundColor: '#fff',
        border: `2px solid ${PURPLE}`,
        borderRadius: '4px',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '24px',
          color: BLACK,
          marginBottom: '8px',
        }}
      >
        What if?
      </h3>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '15px',
          color: GRAY_600,
          marginBottom: '28px',
        }}
      >
        Adjust targets to see how requirements and cost change in real time.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          marginBottom: '32px',
        }}
      >
        <StyledSlider
          min={100}
          max={10000}
          step={100}
          value={latencyTarget}
          onChange={onLatencyChange}
          label="P99 Latency Target"
          displayValue={`${fmtNumber(latencyTarget)} ms`}
        />
        <StyledSlider
          min={1}
          max={500}
          step={1}
          value={throughputTarget}
          onChange={onThroughputChange}
          label="Throughput Target"
          displayValue={`${fmtNumber(throughputTarget)} req/s`}
        />
      </div>

      {/* Comparison */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '16px',
          alignItems: 'stretch',
        }}
      >
        {/* Original */}
        <div
          style={{
            padding: '20px',
            backgroundColor: GRAY_50,
            borderRadius: '4px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '12px',
              color: GRAY_400,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '12px',
            }}
          >
            Original
          </div>
          <div style={{ fontSize: '14px', lineHeight: '28px', color: GRAY_600 }}>
            <div>
              <strong>{originalResult.gpuCount}</strong> GPUs
            </div>
            <div>
              <strong>{originalResult.instanceCount}</strong>{' '}
              {originalResult.instanceCount === 1 ? 'instance' : 'instances'}
            </div>
            <div>
              Latency target: <strong>{fmtNumber(originalLatency)} ms</strong>
            </div>
            <div>
              Throughput target: <strong>{fmtNumber(originalThroughput)} req/s</strong>
            </div>
            <div style={{ marginTop: '8px', fontWeight: 700, color: PURPLE, fontSize: '18px' }}>
              {fmtCurrency(costOriginal)}/mo
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '18px',
              color: costAdjusted > costOriginal ? RED : GREEN,
            }}
          >
            {costDelta}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: GRAY_400,
            }}
          >
            cost
          </div>
        </div>

        {/* Adjusted */}
        <div
          style={{
            padding: '20px',
            backgroundColor: PURPLE_LIGHT,
            borderRadius: '4px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '12px',
              color: PURPLE_DARK,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '12px',
            }}
          >
            Adjusted
          </div>
          <div style={{ fontSize: '14px', lineHeight: '28px', color: GRAY_600 }}>
            <div>
              <strong>{adjustedResult.gpuCount}</strong> GPUs
            </div>
            <div>
              <strong>{adjustedResult.instanceCount}</strong>{' '}
              {adjustedResult.instanceCount === 1 ? 'instance' : 'instances'}
            </div>
            <div>
              Latency target: <strong>{fmtNumber(latencyTarget)} ms</strong>
            </div>
            <div>
              Throughput target: <strong>{fmtNumber(throughputTarget)} req/s</strong>
            </div>
            <div style={{ marginTop: '8px', fontWeight: 700, color: PURPLE, fontSize: '18px' }}>
              {fmtCurrency(costAdjusted)}/mo
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function CapacityPlanner() {
  // Input state
  const [selectedModelId, setSelectedModelId] = useState(models[0]?.id ?? '')
  const [throughputRPS, setThroughputRPS] = useState(100)
  const [p99LatencyMs, setP99LatencyMs] = useState(2000)
  const [avgInputTokens, setAvgInputTokens] = useState(1000)
  const [avgOutputTokens, setAvgOutputTokens] = useState(500)
  const [concurrentUsers, setConcurrentUsers] = useState(100)

  // Provider state
  const [selectedProviderId, setSelectedProviderId] = useState(
    cloudProviders.length > 0 ? cloudProviders[0].id : 'aws',
  )

  const selectedProvider = cloudProviders.find((p) => p.id === selectedProviderId) ?? cloudProviders[0]
  const [selectedInstanceIdx, setSelectedInstanceIdx] = useState(0)

  const handleProviderChange = useCallback((id: string) => {
    setSelectedProviderId(id)
    setSelectedInstanceIdx(0)
  }, [])

  // "What if" state
  const [whatIfLatency, setWhatIfLatency] = useState(p99LatencyMs)
  const [whatIfThroughput, setWhatIfThroughput] = useState(throughputRPS)
  const [showWhatIf, setShowWhatIf] = useState(false)

  // Build target
  const selectedModel = models.find((m) => m.id === selectedModelId) ?? models[0]

  const target: CapacityTarget = useMemo(
    () => ({
      modelId: selectedModel.id,
      throughputRPS,
      p99LatencyMs,
      avgInputTokens,
      avgOutputTokens,
      concurrentUsers,
    }),
    [
      selectedModel,
      throughputRPS,
      p99LatencyMs,
      avgInputTokens,
      avgOutputTokens,
      concurrentUsers,
    ],
  )

  // Calculate result
  const result: CapacityResult = useMemo(
    () => calculateCapacity(target, selectedProviderId, selectedInstanceIdx),
    [target, selectedProviderId, selectedInstanceIdx],
  )

  // Adjusted "what if" result
  const whatIfTarget: CapacityTarget = useMemo(
    () => ({
      ...target,
      p99LatencyMs: whatIfLatency,
      throughputRPS: whatIfThroughput,
    }),
    [target, whatIfLatency, whatIfThroughput],
  )
  const whatIfResult: CapacityResult = useMemo(
    () => calculateCapacity(whatIfTarget, selectedProviderId, selectedInstanceIdx),
    [whatIfTarget, selectedProviderId, selectedInstanceIdx],
  )

  // Sync what-if defaults when main targets change
  const handleCalculate = useCallback(() => {
    setWhatIfLatency(p99LatencyMs)
    setWhatIfThroughput(throughputRPS)
    setShowWhatIf(true)
  }, [p99LatencyMs, throughputRPS])

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
        {/* Header */}
        <div
          style={{
            paddingTop: '140px',
            paddingBottom: '48px',
            backgroundColor: '#EDEDED',
          }}
        >
          <div
            style={{
              maxWidth: '1244px',
              margin: '0 auto',
              padding: '0 30px',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '6px 14px',
                backgroundColor: PURPLE,
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '24px',
              }}
            >
              Interactive Tool
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: 300,
                lineHeight: '110%',
                letterSpacing: '-0.02em',
                color: BLACK,
                marginBottom: '20px',
                maxWidth: '800px',
              }}
            >
              Capacity Planner
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '20px',
                lineHeight: '32px',
                color: GRAY_600,
                maxWidth: '640px',
              }}
            >
              Describe what you want to serve and see exactly what you need.
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div
          style={{
            backgroundColor: GRAY_50,
            padding: '48px 0',
          }}
        >
          <div
            style={{
              maxWidth: '1244px',
              margin: '0 auto',
              padding: '0 30px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '48px',
              }}
            >
              {/* Left Column */}
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '20px',
                    color: BLACK,
                    marginBottom: '24px',
                  }}
                >
                  What are you serving?
                </h3>

                {/* Model selector */}
                <div style={{ marginBottom: '24px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: BLACK,
                      marginBottom: '8px',
                    }}
                  >
                    Model
                  </label>
                  <select
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      fontFamily: 'var(--font-body)',
                      fontSize: '15px',
                      border: `1px solid ${GRAY_200}`,
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                      color: BLACK,
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'auto',
                    }}
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.paramCount})
                      </option>
                    ))}
                  </select>
                </div>

                <StyledSlider
                  min={1}
                  max={500}
                  value={throughputRPS}
                  onChange={setThroughputRPS}
                  label="Throughput Target"
                  displayValue={`${fmtNumber(throughputRPS)} req/s`}
                />

                <StyledSlider
                  min={100}
                  max={10000}
                  step={100}
                  value={p99LatencyMs}
                  onChange={setP99LatencyMs}
                  label="P99 Latency Target"
                  displayValue={`${fmtNumber(p99LatencyMs)} ms`}
                />
              </div>

              {/* Right Column */}
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '20px',
                    color: BLACK,
                    marginBottom: '24px',
                  }}
                >
                  Request characteristics
                </h3>

                <StyledSlider
                  min={100}
                  max={8000}
                  step={100}
                  value={avgInputTokens}
                  onChange={setAvgInputTokens}
                  label="Average Input Tokens"
                  displayValue={fmtNumber(avgInputTokens)}
                />

                <StyledSlider
                  min={50}
                  max={4000}
                  step={50}
                  value={avgOutputTokens}
                  onChange={setAvgOutputTokens}
                  label="Average Output Tokens"
                  displayValue={fmtNumber(avgOutputTokens)}
                />

                <StyledSlider
                  min={10}
                  max={1000}
                  step={10}
                  value={concurrentUsers}
                  onChange={setConcurrentUsers}
                  label="Concurrent Users"
                  displayValue={fmtNumber(concurrentUsers)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Provider Tabs + Instance Selector */}
        <div
          style={{
            maxWidth: '1244px',
            margin: '0 auto',
            padding: '32px 30px 0',
          }}
        >
          <ProviderTabs
            providers={cloudProviders}
            selectedProvider={selectedProviderId}
            onSelect={handleProviderChange}
          />

          {selectedProvider && selectedProvider.gpuOptions.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: BLACK,
                  marginBottom: '8px',
                }}
              >
                GPU Instance Type
              </label>
              <select
                value={selectedInstanceIdx}
                onChange={(e) => setSelectedInstanceIdx(Number(e.target.value))}
                style={{
                  width: '100%',
                  maxWidth: '480px',
                  padding: '12px 14px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  border: `1px solid ${GRAY_200}`,
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  color: BLACK,
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'auto',
                }}
              >
                {selectedProvider.gpuOptions.map((gpu: CloudGPU, idx: number) => (
                  <option key={gpu.instanceType} value={idx}>
                    {gpu.instanceType} ({gpu.gpusPerInstance}x {gpu.gpuId}, ${gpu.costPerHourUSD}/hr)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Calculate button */}
          <div style={{ marginBottom: '32px' }}>
            <button
              onClick={handleCalculate}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 32px',
                backgroundColor: PURPLE,
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '15px',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                border: 'none',
                borderRadius: '0',
                cursor: 'pointer',
                transition: 'background 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = PURPLE_DARK
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = PURPLE
              }}
            >
              Calculate
            </button>
          </div>
        </div>

        {/* Results */}
        <div
          style={{
            maxWidth: '1244px',
            margin: '0 auto',
            padding: '0 30px 80px',
          }}
        >
          <AnimatePresence mode="wait">
            {showWhatIf && (
              <motion.div
                key={`${selectedProviderId}-${selectedInstanceIdx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ResultsCard result={result} target={target} providerName={selectedProvider.name} />

                <WhatIfSection
                  originalResult={result}
                  adjustedResult={whatIfResult}
                  latencyTarget={whatIfLatency}
                  onLatencyChange={setWhatIfLatency}
                  throughputTarget={whatIfThroughput}
                  onThroughputChange={setWhatIfThroughput}
                  originalLatency={p99LatencyMs}
                  originalThroughput={throughputRPS}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  )
}
