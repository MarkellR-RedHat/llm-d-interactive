import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Search, Copy, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react'
import PageTransition from '../components/shared/PageTransition'
import {
  models,
  gpus,
  workloadProfiles,
  generateConfig,
  type ModelSpec,
  type GPUSpec,
  type WorkloadProfile,
  type GeneratedConfig,
} from '../data/configurator-data'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PURPLE = '#9b4d9b'
const PURPLE_DARK = '#7f317f'
const PURPLE_LIGHT = '#f3e8f3'
const BLACK = '#151515'
const GRAY_600 = '#4D4D4D'
const GRAY_400 = '#8A8D90'
const GRAY_300 = '#B8BBBE'
const GRAY_200 = '#D2D2D2'
const GRAY_100 = '#E0E0E0'
const GRAY_50 = '#F0F0F0'

const STEP_LABELS = ['Model', 'Hardware', 'Workload', 'Config'] as const

/* ------------------------------------------------------------------ */
/*  Step Indicator                                                     */
/* ------------------------------------------------------------------ */

function StepIndicator({
  current,
  completed,
}: {
  current: number
  completed: boolean[]
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0',
        padding: '16px 0',
      }}
    >
      {STEP_LABELS.map((label, i) => {
        const isActive = i === current
        const isDone = completed[i]
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '4px',
                backgroundColor: isActive ? PURPLE_LIGHT : 'transparent',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  backgroundColor: isActive
                    ? PURPLE
                    : isDone
                      ? PURPLE
                      : GRAY_200,
                  color: isActive || isDone ? '#fff' : GRAY_600,
                  transition: 'all 0.3s ease',
                }}
              >
                {isDone ? <Check size={14} strokeWidth={3} /> : i + 1}
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '14px',
                  color: isActive ? PURPLE : isDone ? BLACK : GRAY_600,
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                style={{
                  width: '40px',
                  height: '2px',
                  backgroundColor: completed[i] ? PURPLE : GRAY_200,
                  margin: '0 4px',
                  transition: 'background-color 0.3s ease',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Reusable card wrapper                                              */
/* ------------------------------------------------------------------ */

function SelectionCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '28px 24px',
        backgroundColor: selected ? PURPLE_LIGHT : '#fff',
        border: selected
          ? `2px solid ${PURPLE}`
          : `2px solid ${hovered ? GRAY_300 : GRAY_200}`,
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        position: 'relative',
        top: hovered && !selected ? '-2px' : '0',
        boxShadow: hovered && !selected ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
        fontFamily: 'var(--font-body)',
      }}
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Badge                                                              */
/* ------------------------------------------------------------------ */

function Badge({ children, color = PURPLE }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        fontSize: '11px',
        fontWeight: 700,
        fontFamily: 'var(--font-display)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        backgroundColor: color,
        color: '#fff',
        borderRadius: '2px',
      }}
    >
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Primary & outlined button                                          */
/* ------------------------------------------------------------------ */

function PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 28px',
        backgroundColor: disabled ? GRAY_300 : hovered ? PURPLE_DARK : PURPLE,
        color: '#fff',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '15px',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        border: 'none',
        borderRadius: '0',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.3s ease',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  )
}

function OutlinedButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 28px',
        backgroundColor: hovered ? BLACK : 'transparent',
        color: hovered ? '#fff' : BLACK,
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '15px',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        border: `2px solid ${hovered ? BLACK : '#3C3F42'}`,
        borderRadius: '0',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Copy button for code blocks                                        */
/* ------------------------------------------------------------------ */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [text])

  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        fontSize: '12px',
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        color: copied ? '#3E8635' : GRAY_400,
        backgroundColor: 'transparent',
        border: `1px solid ${copied ? '#3E8635' : GRAY_300}`,
        borderRadius: '3px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 1: Model Selection                                            */
/* ------------------------------------------------------------------ */

function ModelStep({
  selected,
  onSelect,
  customModel,
  customParams,
  onCustomModelChange,
  onCustomParamsChange,
}: {
  selected: ModelSpec | null
  onSelect: (m: ModelSpec | null) => void
  customModel: string
  customParams: string
  onCustomModelChange: (v: string) => void
  onCustomParamsChange: (v: string) => void
}) {
  const [filter, setFilter] = useState('')
  const [isCustom, setIsCustom] = useState(false)

  const filtered = models.filter((m) =>
    m.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: GRAY_400,
          }}
        />
        <input
          type="text"
          placeholder="Filter models by name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px 12px 42px',
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            border: `1px solid ${GRAY_200}`,
            borderRadius: '4px',
            outline: 'none',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = PURPLE)}
          onBlur={(e) => (e.currentTarget.style.borderColor = GRAY_200)}
        />
      </div>

      {/* Model cards grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        {filtered.map((model) => (
          <SelectionCard
            key={model.name}
            selected={!isCustom && selected?.name === model.name}
            onClick={() => {
              setIsCustom(false)
              onSelect(model)
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '18px',
                color: BLACK,
                marginBottom: '10px',
              }}
            >
              {model.name}
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                marginBottom: '12px',
              }}
            >
              <Badge>{model.paramCount}</Badge>
              {model.isMoE && <Badge color="#5E40BE">MoE</Badge>}
            </div>
            <div
              style={{
                fontSize: '14px',
                lineHeight: '22px',
                color: GRAY_600,
              }}
            >
              <div>Context: {model.contextLength.toLocaleString()} tokens</div>
              <div>Min GPU memory: {model.minGPUMemoryGB} GB</div>
            </div>
          </SelectionCard>
        ))}

        {/* Custom model card */}
        <SelectionCard
          selected={isCustom}
          onClick={() => {
            setIsCustom(true)
            onSelect(null)
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '18px',
              color: BLACK,
              marginBottom: '10px',
            }}
          >
            Custom Model
          </div>
          <p style={{ fontSize: '14px', color: GRAY_600, marginBottom: '12px' }}>
            Specify your own model name and parameter count.
          </p>
          {isCustom && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="text"
                placeholder="Model name (e.g. my-fine-tune)"
                value={customModel}
                onChange={(e) => onCustomModelChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  padding: '8px 12px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  border: `1px solid ${GRAY_200}`,
                  borderRadius: '3px',
                  outline: 'none',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = PURPLE)}
                onBlur={(e) => (e.currentTarget.style.borderColor = GRAY_200)}
              />
              <input
                type="text"
                placeholder="Param count (e.g. 70B)"
                value={customParams}
                onChange={(e) => onCustomParamsChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  padding: '8px 12px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  border: `1px solid ${GRAY_200}`,
                  borderRadius: '3px',
                  outline: 'none',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = PURPLE)}
                onBlur={(e) => (e.currentTarget.style.borderColor = GRAY_200)}
              />
            </div>
          )}
        </SelectionCard>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 2: Hardware Selection                                         */
/* ------------------------------------------------------------------ */

function HardwareStep({
  selectedGPU,
  onSelectGPU,
  gpuCount,
  onGPUCountChange,
  disaggregated,
  onDisaggregatedChange,
  prefillRatio,
  onPrefillRatioChange,
}: {
  selectedGPU: GPUSpec | null
  onSelectGPU: (g: GPUSpec) => void
  gpuCount: number
  onGPUCountChange: (n: number) => void
  disaggregated: boolean
  onDisaggregatedChange: (v: boolean) => void
  prefillRatio: number
  onPrefillRatioChange: (v: number) => void
}) {
  return (
    <div>
      {/* GPU cards grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {gpus.map((gpu) => (
          <SelectionCard
            key={gpu.name}
            selected={selectedGPU?.name === gpu.name}
            onClick={() => onSelectGPU(gpu)}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '18px',
                color: BLACK,
                marginBottom: '10px',
              }}
            >
              {gpu.name}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <Badge>{gpu.vendor}</Badge>
            </div>
            <div style={{ fontSize: '14px', lineHeight: '22px', color: GRAY_600 }}>
              <div>Memory: {gpu.memoryGB} GB</div>
              <div>Bandwidth: {gpu.memoryBandwidthTBs} TB/s</div>
              <div>Approx. cost: ${gpu.costPerHourUSD.toFixed(2)}/hr per GPU</div>
            </div>
          </SelectionCard>
        ))}
      </div>

      {/* GPU Count */}
      <div
        style={{
          padding: '24px',
          backgroundColor: GRAY_50,
          borderRadius: '4px',
          marginBottom: '24px',
        }}
      >
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '16px',
            color: BLACK,
            marginBottom: '12px',
          }}
        >
          GPU Count: {gpuCount}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: GRAY_600, fontFamily: 'var(--font-mono)' }}>1</span>
          <input
            type="range"
            min={1}
            max={64}
            value={gpuCount}
            onChange={(e) => onGPUCountChange(Number(e.target.value))}
            style={{
              flex: 1,
              accentColor: PURPLE,
              height: '6px',
            }}
          />
          <span style={{ fontSize: '13px', color: GRAY_600, fontFamily: 'var(--font-mono)' }}>64</span>
        </div>
        {selectedGPU && (
          <div
            style={{
              marginTop: '12px',
              fontSize: '14px',
              color: GRAY_600,
              fontFamily: 'var(--font-body)',
            }}
          >
            Estimated cost:{' '}
            <strong style={{ color: BLACK }}>
              ${(selectedGPU.costPerHourUSD * gpuCount).toFixed(2)}/hr
            </strong>{' '}
            (~${(selectedGPU.costPerHourUSD * gpuCount * 730).toFixed(0)}/month)
          </div>
        )}
      </div>

      {/* Disaggregated toggle */}
      <div
        style={{
          padding: '24px',
          backgroundColor: GRAY_50,
          borderRadius: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <button
            onClick={() => onDisaggregatedChange(!disaggregated)}
            style={{
              width: '48px',
              height: '26px',
              borderRadius: '13px',
              border: 'none',
              backgroundColor: disaggregated ? PURPLE : GRAY_300,
              cursor: 'pointer',
              position: 'relative',
              transition: 'background-color 0.2s ease',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                position: 'absolute',
                top: '3px',
                left: disaggregated ? '25px' : '3px',
                transition: 'left 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
            />
          </button>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '16px',
              color: BLACK,
            }}
          >
            Enable Disaggregated Serving
          </span>
        </div>
        <p
          style={{
            fontSize: '14px',
            lineHeight: '22px',
            color: GRAY_600,
            marginLeft: '60px',
            marginBottom: disaggregated ? '20px' : '0',
          }}
        >
          Split inference into separate prefill and decode pools for independent
          scaling and better hardware utilization.
        </p>

        {/* Prefill/Decode ratio slider */}
        {disaggregated && (
          <div style={{ marginLeft: '60px' }}>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '14px',
                color: BLACK,
                marginBottom: '10px',
              }}
            >
              Prefill / Decode Ratio: {prefillRatio}% prefill, {100 - prefillRatio}% decode
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: GRAY_600, fontFamily: 'var(--font-mono)' }}>
                Prefill
              </span>
              <input
                type="range"
                min={10}
                max={90}
                step={10}
                value={prefillRatio}
                onChange={(e) => onPrefillRatioChange(Number(e.target.value))}
                style={{ flex: 1, accentColor: PURPLE }}
              />
              <span style={{ fontSize: '12px', color: GRAY_600, fontFamily: 'var(--font-mono)' }}>
                Decode
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '4px',
                marginTop: '8px',
                height: '8px',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  flex: prefillRatio,
                  backgroundColor: PURPLE,
                  borderRadius: '4px 0 0 4px',
                  transition: 'flex 0.3s ease',
                }}
              />
              <div
                style={{
                  flex: 100 - prefillRatio,
                  backgroundColor: '#5E40BE',
                  borderRadius: '0 4px 4px 0',
                  transition: 'flex 0.3s ease',
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '4px',
                fontSize: '12px',
                color: GRAY_600,
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span>
                {Math.round((gpuCount * prefillRatio) / 100)} GPUs
              </span>
              <span>
                {Math.round((gpuCount * (100 - prefillRatio)) / 100)} GPUs
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 3: Workload Profile                                           */
/* ------------------------------------------------------------------ */

function WorkloadStep({
  selectedProfile,
  onSelectProfile,
  overrides,
  onOverridesChange,
}: {
  selectedProfile: WorkloadProfile | null
  onSelectProfile: (p: WorkloadProfile) => void
  overrides: WorkloadOverrides
  onOverridesChange: (o: WorkloadOverrides) => void
}) {
  return (
    <div>
      {/* Profile cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {workloadProfiles.map((profile) => (
          <SelectionCard
            key={profile.name}
            selected={selectedProfile?.name === profile.name}
            onClick={() => {
              onSelectProfile(profile)
              onOverridesChange({
                inputTokens: profile.avgInputTokens,
                outputTokens: profile.avgOutputTokens,
                ttftTarget: profile.targetTTFTms,
                itlTarget: profile.targetITLms,
                concurrentUsers: profile.concurrentUsers,
              })
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '18px',
                color: BLACK,
                marginBottom: '8px',
              }}
            >
              {profile.name}
            </div>
            <p
              style={{
                fontSize: '14px',
                lineHeight: '22px',
                color: GRAY_600,
                marginBottom: '12px',
              }}
            >
              {profile.description}
            </p>
            <div style={{ fontSize: '13px', lineHeight: '20px', color: GRAY_400 }}>
              <div>Avg input: {profile.avgInputTokens.toLocaleString()} tokens</div>
              <div>Avg output: {profile.avgOutputTokens.toLocaleString()} tokens</div>
              <div>TTFT target: {profile.targetTTFTms}ms</div>
              <div>ITL target: {profile.targetITLms}ms</div>
              <div>Concurrent users: {profile.concurrentUsers}</div>
            </div>
          </SelectionCard>
        ))}
      </div>

      {/* Override inputs */}
      {selectedProfile && (
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
              marginBottom: '16px',
            }}
          >
            Customize Parameters
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            <OverrideField
              label="Input Tokens"
              value={overrides.inputTokens}
              onChange={(v) =>
                onOverridesChange({ ...overrides, inputTokens: v })
              }
            />
            <OverrideField
              label="Output Tokens"
              value={overrides.outputTokens}
              onChange={(v) =>
                onOverridesChange({ ...overrides, outputTokens: v })
              }
            />
            <OverrideField
              label="TTFT Target (ms)"
              value={overrides.ttftTarget}
              onChange={(v) =>
                onOverridesChange({ ...overrides, ttftTarget: v })
              }
            />
            <OverrideField
              label="ITL Target (ms)"
              value={overrides.itlTarget}
              onChange={(v) =>
                onOverridesChange({ ...overrides, itlTarget: v })
              }
            />
            <OverrideField
              label="Concurrent Users"
              value={overrides.concurrentUsers}
              onChange={(v) =>
                onOverridesChange({ ...overrides, concurrentUsers: v })
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}

function OverrideField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: '13px',
          color: GRAY_600,
          marginBottom: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontFamily: 'var(--font-mono)',
          fontSize: '14px',
          border: `1px solid ${GRAY_200}`,
          borderRadius: '3px',
          outline: 'none',
          backgroundColor: '#fff',
          transition: 'border-color 0.2s ease',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = PURPLE)}
        onBlur={(e) => (e.currentTarget.style.borderColor = GRAY_200)}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 4: Generated Config                                           */
/* ------------------------------------------------------------------ */

function ConfigStep({ config }: { config: GeneratedConfig }) {
  const [activeTab, setActiveTab] = useState<'helm' | 'epp' | 'notes'>('helm')
  const tabs = [
    { id: 'helm' as const, label: 'Helm Values' },
    { id: 'epp' as const, label: 'EPP Config' },
    { id: 'notes' as const, label: 'Notes' },
  ]

  const currentCode = activeTab === 'helm' ? config.helmValues : activeTab === 'epp' ? config.eppConfig : ''

  return (
    <div>
      {/* Summary stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {[
          { label: 'Total GPUs', value: String(config.estimatedGPUCount) },
          {
            label: 'Prefill / Decode',
            value: config.estimatedPrefillGPUs
              ? `${config.estimatedPrefillGPUs}P / ${config.estimatedDecodeGPUs}D`
              : 'Combined',
          },
          {
            label: 'Est. Cost / Hour',
            value: `$${config.estimatedCostPerHour.toFixed(2)}`,
          },
          {
            label: 'Est. Cost / Month',
            value: `$${(config.estimatedCostPerHour * 730).toFixed(0)}`,
          },
        ].map((stat) => (
          <div
            key={stat.label}
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
                fontWeight: 700,
                fontSize: '24px',
                color: PURPLE,
                marginBottom: '4px',
              }}
            >
              {stat.value}
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
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tabbed code blocks */}
      <div
        style={{
          border: `1px solid ${GRAY_200}`,
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        {/* Tab bar */}
        <div
          style={{
            display: 'flex',
            borderBottom: `1px solid ${GRAY_200}`,
            backgroundColor: GRAY_50,
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                fontFamily: 'var(--font-display)',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '14px',
                color: activeTab === tab.id ? PURPLE : GRAY_600,
                backgroundColor: activeTab === tab.id ? '#fff' : 'transparent',
                border: 'none',
                borderBottom:
                  activeTab === tab.id
                    ? `2px solid ${PURPLE}`
                    : '2px solid transparent',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          {activeTab !== 'notes' && (
            <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center' }}>
              <CopyButton text={currentCode} />
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ backgroundColor: activeTab === 'notes' ? '#fff' : BLACK }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'notes' ? (
                <div style={{ padding: '24px' }}>
                  <ul
                    style={{
                      listStyle: 'disc',
                      paddingLeft: '20px',
                      fontFamily: 'var(--font-body)',
                      fontSize: '15px',
                      lineHeight: '26px',
                      color: GRAY_600,
                    }}
                  >
                    {config.notes.map((note, i) => (
                      <li key={i} style={{ marginBottom: '8px' }}>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <pre
                  style={{
                    padding: '24px',
                    margin: 0,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    lineHeight: '22px',
                    color: '#D2D2D2',
                    overflowX: 'auto',
                    whiteSpace: 'pre',
                  }}
                >
                  <code>{currentCode}</code>
                </pre>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Workload overrides type                                            */
/* ------------------------------------------------------------------ */

interface WorkloadOverrides {
  inputTokens: number
  outputTokens: number
  ttftTarget: number
  itlTarget: number
  concurrentUsers: number
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function Configurator() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  // Step 1 state
  const [selectedModel, setSelectedModel] = useState<ModelSpec | null>(null)
  const [customModelName, setCustomModelName] = useState('')
  const [customParamCount, setCustomParamCount] = useState('')

  // Step 2 state
  const [selectedGPU, setSelectedGPU] = useState<GPUSpec | null>(null)
  const [gpuCount, setGPUCount] = useState(8)
  const [disaggregated, setDisaggregated] = useState(true)
  const [prefillRatio, setPrefillRatio] = useState(50)

  // Step 3 state
  const [selectedProfile, setSelectedProfile] = useState<WorkloadProfile | null>(null)
  const [overrides, setOverrides] = useState<WorkloadOverrides>({
    inputTokens: 512,
    outputTokens: 256,
    ttftTarget: 500,
    itlTarget: 30,
    concurrentUsers: 100,
  })

  // Step completion checks
  const isStep1Complete =
    selectedModel !== null || (customModelName.trim() !== '' && customParamCount.trim() !== '')
  const isStep2Complete = selectedGPU !== null
  const isStep3Complete = selectedProfile !== null

  const completed = [isStep1Complete, isStep2Complete, isStep3Complete, false]

  // Generated config for step 4
  const [generatedConfig, setGeneratedConfig] = useState<GeneratedConfig | null>(null)

  // Sticky step indicator
  const [isSticky, setIsSticky] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const goNext = useCallback(() => {
    if (step === 2) {
      // Generate config before moving to step 4
      const modelName = selectedModel?.name ?? customModelName
      const modelParams = selectedModel?.paramCount ?? customParamCount
      const effectiveModel: ModelSpec = selectedModel ?? {
        id: customModelName.toLowerCase().replace(/\s+/g, '-'),
        name: modelName,
        paramCount: modelParams,
        family: 'Custom',
        contextLength: 8192,
        isMoE: false,
        minGPUMemoryGB: 80,
        recommendedTP: 1,
        tags: [],
      }
      const effectiveWorkload: WorkloadProfile = {
        id: selectedProfile?.id ?? 'custom',
        name: selectedProfile?.name ?? 'Custom',
        description: selectedProfile?.description ?? '',
        avgInputTokens: overrides.inputTokens,
        avgOutputTokens: overrides.outputTokens,
        targetTTFTms: overrides.ttftTarget,
        targetITLms: overrides.itlTarget,
        concurrentUsers: overrides.concurrentUsers,
        burstFactor: selectedProfile?.burstFactor ?? 1.0,
      }
      const config = generateConfig(
        effectiveModel,
        selectedGPU!,
        effectiveWorkload,
        disaggregated,
        gpuCount,
      )
      setGeneratedConfig(config)
    }
    setDirection(1)
    setStep((s) => Math.min(s + 1, 3))
  }, [step, selectedModel, selectedProfile, customModelName, customParamCount, selectedGPU, gpuCount, disaggregated, prefillRatio, overrides])

  const goBack = useCallback(() => {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }, [])

  const startOver = useCallback(() => {
    setDirection(-1)
    setStep(0)
    setSelectedModel(null)
    setCustomModelName('')
    setCustomParamCount('')
    setSelectedGPU(null)
    setGPUCount(8)
    setDisaggregated(true)
    setPrefillRatio(50)
    setSelectedProfile(null)
    setOverrides({
      inputTokens: 512,
      outputTokens: 256,
      ttftTarget: 500,
      itlTarget: 30,
      concurrentUsers: 100,
    })
    setGeneratedConfig(null)
  }, [])

  const canProceed =
    step === 0
      ? isStep1Complete
      : step === 1
        ? isStep2Complete
        : step === 2
          ? isStep3Complete
          : false

  const slideVariants = {
    enter: (d: number) => ({
      x: d > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (d: number) => ({
      x: d > 0 ? -80 : 80,
      opacity: 0,
    }),
  }

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
        {/* Page header */}
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
              Deployment Configurator
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
              Select your model, hardware, and workload profile to generate a
              complete, ready-to-apply{' '}
              <span style={{ whiteSpace: 'nowrap' }}>llm&#x2011;d</span>{' '}
              deployment configuration.
            </p>
          </div>
        </div>

        {/* Sentinel for IntersectionObserver */}
        <div ref={sentinelRef} style={{ height: '1px', margin: 0, padding: 0 }} />

        {/* Sticky step indicator */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: '#fff',
            borderBottom: `1px solid ${GRAY_100}`,
            boxShadow: isSticky ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            transition: 'box-shadow 0.3s ease',
          }}
        >
          <div
            style={{
              maxWidth: '1244px',
              margin: '0 auto',
              padding: '0 30px',
            }}
          >
            <StepIndicator current={step} completed={completed} />
          </div>
        </div>

        {/* Step content */}
        <div
          style={{
            maxWidth: '1244px',
            margin: '0 auto',
            padding: '48px 30px 80px',
          }}
        >
          {/* Step title */}
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '28px',
              color: BLACK,
              marginBottom: '8px',
            }}
          >
            {step === 0 && 'Choose Your Model'}
            {step === 1 && 'Select Hardware'}
            {step === 2 && 'Define Workload Profile'}
            {step === 3 && 'Your Generated Configuration'}
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              lineHeight: '26px',
              color: GRAY_600,
              marginBottom: '32px',
              maxWidth: '640px',
            }}
          >
            {step === 0 &&
              'Pick a model from the catalog or specify a custom model.'}
            {step === 1 &&
              'Choose your GPU type, count, and serving topology.'}
            {step === 2 &&
              'Select a workload profile or customize the parameters to match your use case.'}
            {step === 3 &&
              'Review your configuration and copy the Helm values or EPP config to deploy.'}
          </p>

          {/* Animated step content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {step === 0 && (
                <ModelStep
                  selected={selectedModel}
                  onSelect={setSelectedModel}
                  customModel={customModelName}
                  customParams={customParamCount}
                  onCustomModelChange={setCustomModelName}
                  onCustomParamsChange={setCustomParamCount}
                />
              )}
              {step === 1 && (
                <HardwareStep
                  selectedGPU={selectedGPU}
                  onSelectGPU={setSelectedGPU}
                  gpuCount={gpuCount}
                  onGPUCountChange={setGPUCount}
                  disaggregated={disaggregated}
                  onDisaggregatedChange={setDisaggregated}
                  prefillRatio={prefillRatio}
                  onPrefillRatioChange={setPrefillRatio}
                />
              )}
              {step === 2 && (
                <WorkloadStep
                  selectedProfile={selectedProfile}
                  onSelectProfile={setSelectedProfile}
                  overrides={overrides}
                  onOverridesChange={setOverrides}
                />
              )}
              {step === 3 && generatedConfig && (
                <ConfigStep config={generatedConfig} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: step === 0 ? 'flex-end' : 'space-between',
              alignItems: 'center',
              marginTop: '48px',
              paddingTop: '24px',
              borderTop: `1px solid ${GRAY_100}`,
            }}
          >
            {step > 0 && (
              <OutlinedButton onClick={step === 3 ? startOver : goBack}>
                {step === 3 ? (
                  <>
                    <RotateCcw size={16} /> Start Over
                  </>
                ) : (
                  <>
                    <ChevronLeft size={16} /> Back
                  </>
                )}
              </OutlinedButton>
            )}
            {step < 3 && (
              <PrimaryButton onClick={goNext} disabled={!canProceed}>
                Next <ChevronRight size={16} />
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
