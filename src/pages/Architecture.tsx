import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/shared/PageTransition'

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
const GRAY_50 = '#F0F0F0'
const WHITE = '#ffffff'

/* ------------------------------------------------------------------ */
/*  Component data                                                     */
/* ------------------------------------------------------------------ */

interface ComponentInfo {
  id: string
  name: string
  subtitle?: string
  whatItDoes: string
  keyConfig: { key: string; value: string }[]
  failureMode: string
  related: string[]
}

const COMPONENTS: Record<string, ComponentInfo> = {
  client: {
    id: 'client',
    name: 'Client',
    whatItDoes:
      'Sends inference requests to the llm‑d cluster via the OpenAI-compatible API. Any application, script, or SDK that speaks the Chat Completions protocol can act as a client.',
    keyConfig: [],
    failureMode: 'Requests stop arriving. No impact on the cluster itself.',
    related: ['envoy'],
  },
  envoy: {
    id: 'envoy',
    name: 'Envoy Proxy',
    subtitle: 'API Gateway',
    whatItDoes:
      'High-performance L7 proxy that accepts incoming inference requests and consults the Endpoint Picker via the ext-proc (external processing) protocol to decide which backend pod should handle each request.',
    keyConfig: [
      { key: 'listener_port', value: '8080 / 443' },
      { key: 'tls_context', value: 'certificate + key paths' },
      { key: 'timeout', value: '300s (streaming)' },
      { key: 'ext_proc_cluster', value: 'epp-grpc' },
    ],
    failureMode:
      'All inbound requests are blocked. Requires an HA (multi-replica) deployment with health checks to avoid single-point-of-failure.',
    related: ['client', 'epp'],
  },
  epp: {
    id: 'epp',
    name: 'Endpoint Picker (EPP)',
    subtitle: 'llm‑d Router',
    whatItDoes:
      'The routing brain of llm‑d. Scores every available replica using a pluggable pipeline of filters, scorers, and pickers, then returns the best endpoint to Envoy. Supports scheduling profiles that combine multiple scoring strategies with configurable weights.',
    keyConfig: [
      { key: 'schedulingProfiles', value: '[default, prefill-optimized]' },
      { key: 'prefix-cache-scorer', value: 'weight: 60' },
      { key: 'kv-cache-utilization-scorer', value: 'weight: 20' },
      { key: 'queue-scorer', value: 'weight: 20' },
      { key: 'plugins', value: 'EndpointPickerConfig YAML' },
    ],
    failureMode:
      'Routing falls back to round-robin (no intelligent placement). Requests may queue behind overloaded replicas and cache locality is lost.',
    related: ['envoy', 'prefill', 'decode', 'kv-indexer', 'latency-predictor'],
  },
  prefill: {
    id: 'prefill',
    name: 'Prefill Workers',
    subtitle: 'Compute-bound',
    whatItDoes:
      'vLLM instances optimized for processing input tokens in parallel. They handle the initial prompt ingestion phase, converting the full input sequence into KV cache entries in one forward pass. This phase is compute-bound and benefits from high FLOPS.',
    keyConfig: [
      { key: 'tensor-parallelism', value: '2 or 4 (per model size)' },
      { key: 'max-model-len', value: '32768' },
      { key: 'gpu-memory-utilization', value: '0.92' },
    ],
    failureMode:
      'Prefill requests queue on remaining workers. Time-to-first-token (TTFT) increases proportionally to lost capacity.',
    related: ['epp', 'kv-gpu', 'kv-cpu', 'autoscaler'],
  },
  decode: {
    id: 'decode',
    name: 'Decode Workers',
    subtitle: 'Memory-bandwidth-bound',
    whatItDoes:
      'vLLM instances optimized for autoregressive token generation. Each forward pass generates one token, making this phase memory-bandwidth-bound rather than compute-bound. Tuned for high throughput at low inter-token latency.',
    keyConfig: [
      { key: 'tensor-parallelism', value: '1 or 2' },
      { key: 'max-model-len', value: '32768' },
      { key: 'gpu-memory-utilization', value: '0.90' },
    ],
    failureMode:
      'In-progress generations stall. Inter-token latency (ITL) increases as surviving workers absorb extra sequences.',
    related: ['epp', 'kv-gpu', 'kv-cpu', 'autoscaler'],
  },
  'kv-gpu': {
    id: 'kv-gpu',
    name: 'KV Cache (GPU HBM)',
    subtitle: 'Fastest tier',
    whatItDoes:
      'Stores active attention key-value state directly in GPU high-bandwidth memory. This is the fastest cache tier, accessed on every forward pass. Capacity is limited by the GPU memory not used by model weights and activations.',
    keyConfig: [
      { key: 'gpu-memory-utilization', value: '0.90 (fraction of GPU mem for KV)' },
    ],
    failureMode:
      'Cache entries are evicted under pressure, forcing prefill recomputation for evicted sequences. Throughput drops and TTFT rises.',
    related: ['prefill', 'decode', 'kv-cpu', 'kv-indexer'],
  },
  'kv-cpu': {
    id: 'kv-cpu',
    name: 'KV Cache (CPU DRAM)',
    subtitle: 'Second tier',
    whatItDoes:
      'Offloaded KV cache entries that no longer fit in GPU HBM are stored in host CPU memory. Access is slower than HBM but far faster than disk, and capacity is typically 10-20x larger.',
    keyConfig: [
      { key: 'cpu-offload-gb', value: '64 (GiB reserved for KV on host)' },
    ],
    failureMode:
      'Falls back to GPU-only caching. Effective cache size shrinks dramatically, increasing eviction rate and prefill recomputation.',
    related: ['kv-gpu', 'kv-disk', 'kv-indexer'],
  },
  'kv-disk': {
    id: 'kv-disk',
    name: 'KV Cache (Disk/NVMe)',
    subtitle: 'Slowest tier',
    whatItDoes:
      'The slowest but nearly unlimited capacity tier. KV cache blocks are serialized to local NVMe storage when both GPU and CPU tiers are full. Useful for very long contexts or large batch sizes.',
    keyConfig: [
      { key: 'disk-offload-path', value: '/mnt/nvme/kv-cache' },
      { key: 'disk-offload-gb', value: '512' },
    ],
    failureMode:
      'Falls back to CPU + GPU tiers only. Maximum effective context window may shrink for large batches.',
    related: ['kv-cpu', 'kv-gpu', 'kv-indexer'],
  },
  'kv-indexer': {
    id: 'kv-indexer',
    name: 'KV Cache Indexer',
    whatItDoes:
      'Tracks which prefix blocks exist on which replicas by consuming high-frequency cache-mutation events. The Endpoint Picker queries the indexer to make prefix-cache-aware routing decisions.',
    keyConfig: [
      { key: 'event-source', value: 'vLLM cache events (gRPC stream)' },
      { key: 'sync-interval', value: '500ms' },
    ],
    failureMode:
      'Prefix-cache-aware routing degrades to approximate matching or falls back to non-cache-aware scoring. Requests are routed less efficiently but still succeed.',
    related: ['epp', 'kv-gpu', 'kv-cpu', 'kv-disk'],
  },
  autoscaler: {
    id: 'autoscaler',
    name: 'Autoscaler',
    whatItDoes:
      'Monitors inference-specific signals (queue depth, p99 latency, throughput) and adjusts worker replica counts to meet SLO targets. Supports scale-to-zero for cost efficiency during idle periods.',
    keyConfig: [
      { key: 'slo.p99_ttft', value: '2000ms' },
      { key: 'slo.p99_itl', value: '100ms' },
      { key: 'min_replicas', value: '2' },
      { key: 'max_replicas', value: '16' },
      { key: 'scale_to_zero', value: 'true (idle > 5m)' },
    ],
    failureMode:
      'Cluster runs at a fixed replica count. No adaptation to traffic spikes or quiet periods, risking SLO breaches or wasted resources.',
    related: ['prefill', 'decode', 'epp'],
  },
  'latency-predictor': {
    id: 'latency-predictor',
    name: 'Latency Predictor',
    whatItDoes:
      'An XGBoost model trained online on live traffic to predict per-request inter-token latency (ITL) and time-to-first-token (TTFT). The EPP uses these predictions to route each request to the replica expected to serve it fastest.',
    keyConfig: [
      { key: 'training-interval', value: '30s (online refit)' },
      { key: 'feature-set', value: 'queue depth, seq len, cache hit ratio' },
      { key: 'slo-headers', value: 'X-Expected-TTFT, X-Expected-ITL' },
    ],
    failureMode:
      'Routing falls back to heuristic scoring (static weights). Latency predictions stop updating, reducing routing optimality under shifting workloads.',
    related: ['epp'],
  },
  'inference-pool': {
    id: 'inference-pool',
    name: 'InferencePool',
    subtitle: 'Kubernetes CRD',
    whatItDoes:
      'A Kubernetes Custom Resource that defines a logical group of model-server pods. The EPP watches InferencePool objects to discover which pods are available and what model they serve.',
    keyConfig: [
      { key: 'spec.modelName', value: 'meta-llama/Llama-3-70B' },
      { key: 'spec.targetPort', value: '8000' },
      { key: 'spec.selector', value: 'app: vllm-llama-70b' },
    ],
    failureMode:
      'Not a runtime component. If the CRD is deleted, the EPP loses its endpoint list and cannot route until it is recreated.',
    related: ['epp', 'prefill', 'decode'],
  },
}

/* ------------------------------------------------------------------ */
/*  Diagram layout definitions                                         */
/* ------------------------------------------------------------------ */

interface BoxDef {
  id: string
  label: string
  sublabel?: string
  x: number
  y: number
  w: number
  h: number
  accent?: boolean
  group?: string
}

interface LineDef {
  from: string
  to: string
}

const DIAGRAM_W = 700
const DIAGRAM_H = 580

const BOXES: BoxDef[] = [
  // Layer 1 - Client
  { id: 'client', label: 'Client', x: 290, y: 0, w: 120, h: 44 },
  // Layer 2 - Envoy
  { id: 'envoy', label: 'Envoy Proxy', sublabel: 'API Gateway', x: 240, y: 80, w: 220, h: 50 },
  // Layer 3 - EPP (prominent)
  { id: 'epp', label: 'Endpoint Picker', sublabel: 'llm‑d Router', x: 220, y: 170, w: 260, h: 56, accent: true },
  // Layer 4 - Workers (2 per group)
  { id: 'prefill', label: 'Prefill Worker 1', x: 60, y: 280, w: 140, h: 40, group: 'prefill-group' },
  { id: 'prefill-2', label: 'Prefill Worker 2', x: 60, y: 326, w: 140, h: 40, group: 'prefill-group' },
  { id: 'decode', label: 'Decode Worker 1', x: 500, y: 280, w: 140, h: 40, group: 'decode-group' },
  { id: 'decode-2', label: 'Decode Worker 2', x: 500, y: 326, w: 140, h: 40, group: 'decode-group' },
  // Layer 5 - KV Cache
  { id: 'kv-gpu', label: 'GPU HBM', x: 80, y: 430, w: 160, h: 42 },
  { id: 'kv-cpu', label: 'CPU DRAM', x: 270, y: 430, w: 160, h: 42 },
  { id: 'kv-disk', label: 'Disk / NVMe', x: 460, y: 430, w: 160, h: 42 },
  { id: 'kv-indexer', label: 'KV Cache Indexer', x: 270, y: 500, w: 160, h: 42 },
  // Side components
  { id: 'autoscaler', label: 'Autoscaler', x: 0, y: 200, w: 130, h: 44 },
  { id: 'latency-predictor', label: 'Latency Predictor', x: 560, y: 170, w: 140, h: 44 },
  { id: 'inference-pool', label: 'InferencePool', sublabel: 'K8s CRD', x: 560, y: 224, w: 140, h: 44 },
]

const LINES: LineDef[] = [
  { from: 'client', to: 'envoy' },
  { from: 'envoy', to: 'epp' },
  { from: 'epp', to: 'prefill' },
  { from: 'epp', to: 'decode' },
  { from: 'prefill-2', to: 'kv-gpu' },
  { from: 'decode-2', to: 'kv-disk' },
  { from: 'kv-gpu', to: 'kv-cpu' },
  { from: 'kv-cpu', to: 'kv-disk' },
  { from: 'kv-cpu', to: 'kv-indexer' },
  { from: 'epp', to: 'autoscaler' },
  { from: 'autoscaler', to: 'prefill' },
  { from: 'autoscaler', to: 'decode' },
  { from: 'epp', to: 'latency-predictor' },
  { from: 'epp', to: 'inference-pool' },
]

/* Map grouped boxes (prefill-2, decode-2, etc.) to their data key */
function resolveDataKey(id: string): string {
  if (id.startsWith('prefill')) return 'prefill'
  if (id.startsWith('decode')) return 'decode'
  return id
}

/* Check whether a line connects to the given box (or its data key) */
function lineConnects(line: LineDef, boxId: string): boolean {
  const dk = resolveDataKey(boxId)
  return (
    line.from === boxId ||
    line.to === boxId ||
    resolveDataKey(line.from) === dk ||
    resolveDataKey(line.to) === dk
  )
}

/* ------------------------------------------------------------------ */
/*  Connection lines (SVG overlay)                                     */
/* ------------------------------------------------------------------ */

function getBoxCenter(box: BoxDef): { cx: number; cy: number } {
  return { cx: box.x + box.w / 2, cy: box.y + box.h / 2 }
}

function getAnchor(
  from: BoxDef,
  to: BoxDef,
): { x1: number; y1: number; x2: number; y2: number } {
  const fc = getBoxCenter(from)
  const tc = getBoxCenter(to)

  let x1 = fc.cx
  let y1 = fc.cy
  let x2 = tc.cx
  let y2 = tc.cy

  // Snap to edge
  if (Math.abs(fc.cy - tc.cy) > Math.abs(fc.cx - tc.cx)) {
    // Vertical dominant
    if (fc.cy < tc.cy) {
      y1 = from.y + from.h
      y2 = to.y
    } else {
      y1 = from.y
      y2 = to.y + to.h
    }
  } else {
    // Horizontal dominant
    if (fc.cx < tc.cx) {
      x1 = from.x + from.w
      x2 = to.x
    } else {
      x1 = from.x
      x2 = to.x + to.w
    }
  }

  return { x1, y1, x2, y2 }
}

function ConnectionLines({
  selected,
}: {
  selected: string | null
}) {
  const boxMap = new Map(BOXES.map((b) => [b.id, b]))

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: DIAGRAM_W,
        height: DIAGRAM_H,
        pointerEvents: 'none',
      }}
    >
      {LINES.map((line) => {
        const fb = boxMap.get(line.from)
        const tb = boxMap.get(line.to)
        if (!fb || !tb) return null

        const { x1, y1, x2, y2 } = getAnchor(fb, tb)
        const isHighlighted =
          selected !== null && (lineConnects(line, selected))

        return (
          <line
            key={`${line.from}-${line.to}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={isHighlighted ? PURPLE : GRAY_300}
            strokeWidth={isHighlighted ? 2.5 : 1.5}
            strokeDasharray={isHighlighted ? 'none' : '6 4'}
            style={{ transition: 'all 0.3s ease' }}
          />
        )
      })}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Group labels                                                       */
/* ------------------------------------------------------------------ */

function GroupLabels() {
  return (
    <>
      {/* Prefill group label */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          top: 258,
          fontSize: '11px',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: GRAY_400,
        }}
      >
        Prefill Workers
      </div>
      {/* Decode group label */}
      <div
        style={{
          position: 'absolute',
          left: 500,
          top: 258,
          fontSize: '11px',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: GRAY_400,
        }}
      >
        Decode Workers
      </div>
      {/* KV Cache layer label */}
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 395,
          fontSize: '11px',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: GRAY_400,
        }}
      >
        KV Cache Layer
      </div>
      {/* KV Cache backdrop */}
      <div
        style={{
          position: 'absolute',
          left: 65,
          top: 416,
          width: 570,
          height: 145,
          borderRadius: '12px',
          border: `1.5px dashed ${GRAY_200}`,
          backgroundColor: 'rgba(240, 240, 240, 0.3)',
          pointerEvents: 'none',
        }}
      />
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Component box                                                      */
/* ------------------------------------------------------------------ */

function ComponentBox({
  box,
  isSelected,
  onSelect,
}: {
  box: BoxDef
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const dataKey = resolveDataKey(box.id)
  const info = COMPONENTS[dataKey]
  const hasDetail = !!info

  return (
    <motion.div
      onClick={() => {
        if (hasDetail) onSelect(box.id)
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{
        scale: hovered && hasDetail ? 1.04 : 1,
        borderColor: isSelected ? PURPLE : hovered && hasDetail ? PURPLE_DARK : GRAY_200,
        backgroundColor: isSelected ? PURPLE_LIGHT : WHITE,
      }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'absolute',
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        borderRadius: '8px',
        border: `2px solid ${isSelected ? PURPLE : GRAY_200}`,
        backgroundColor: isSelected ? PURPLE_LIGHT : WHITE,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: hasDetail ? 'pointer' : 'default',
        boxShadow: isSelected
          ? `0 0 0 3px ${PURPLE_LIGHT}`
          : hovered && hasDetail
            ? '0 4px 12px rgba(0,0,0,0.08)'
            : '0 1px 4px rgba(0,0,0,0.04)',
        zIndex: isSelected || hovered ? 10 : 1,
        padding: '4px 8px',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: box.accent ? '14px' : '12px',
          color: isSelected ? PURPLE_DARK : BLACK,
          lineHeight: 1.2,
          textAlign: 'center',
        }}
      >
        {box.label}
      </span>
      {box.sublabel && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: '10px',
            color: isSelected ? PURPLE : GRAY_400,
            marginTop: '2px',
          }}
        >
          {box.sublabel}
        </span>
      )}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Detail panel                                                       */
/* ------------------------------------------------------------------ */

function DetailPanel({
  info,
  onSelectRelated,
  onClose,
}: {
  info: ComponentInfo
  onSelectRelated: (id: string) => void
  onClose: () => void
}) {
  return (
    <motion.div
      key={info.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25 }}
      style={{
        backgroundColor: WHITE,
        border: `2px solid ${PURPLE}`,
        borderRadius: '12px',
        padding: '28px 32px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(155, 77, 155, 0.10)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '20px',
              color: PURPLE_DARK,
              margin: 0,
            }}
          >
            {info.name}
          </h3>
          {info.subtitle && (
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                color: PURPLE,
                margin: '2px 0 0',
              }}
            >
              {info.subtitle}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            color: GRAY_400,
            cursor: 'pointer',
            padding: '0 4px',
            lineHeight: 1,
          }}
          aria-label="Close detail panel"
        >
          x
        </button>
      </div>

      {/* What it does */}
      <div style={{ marginTop: '20px' }}>
        <h4
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '12px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: PURPLE,
            margin: '0 0 6px',
          }}
        >
          What it does
        </h4>
        <p style={{ fontSize: '14px', color: GRAY_600, lineHeight: 1.7, margin: 0 }}>
          {info.whatItDoes}
        </p>
      </div>

      {/* Key configuration */}
      {info.keyConfig.length > 0 && (
        <div style={{ marginTop: '18px' }}>
          <h4
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '12px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: PURPLE,
              margin: '0 0 8px',
            }}
          >
            Key configuration
          </h4>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {info.keyConfig.map((cfg) => (
              <div
                key={cfg.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: '12px',
                  padding: '5px 10px',
                  backgroundColor: GRAY_50,
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              >
                <code
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: PURPLE_DARK,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cfg.key}
                </code>
                <span style={{ color: GRAY_600, textAlign: 'right' }}>{cfg.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Failure mode */}
      <div style={{ marginTop: '18px' }}>
        <h4
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '12px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#c0392b',
            margin: '0 0 6px',
          }}
        >
          What happens when it fails
        </h4>
        <p
          style={{
            fontSize: '14px',
            color: GRAY_600,
            lineHeight: 1.7,
            margin: 0,
            padding: '8px 12px',
            backgroundColor: '#fdf2f2',
            borderRadius: '6px',
            borderLeft: '3px solid #c0392b',
          }}
        >
          {info.failureMode}
        </p>
      </div>

      {/* Related components */}
      {info.related.length > 0 && (
        <div style={{ marginTop: '18px' }}>
          <h4
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '12px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: PURPLE,
              margin: '0 0 8px',
            }}
          >
            Related components
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {info.related.map((rid) => {
              const rel = COMPONENTS[rid]
              if (!rel) return null
              return (
                <button
                  key={rid}
                  onClick={() => onSelectRelated(rid)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '16px',
                    border: `1.5px solid ${PURPLE}`,
                    backgroundColor: WHITE,
                    color: PURPLE,
                    fontSize: '12px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = PURPLE_LIGHT
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = WHITE
                  }}
                >
                  {rel.name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function Architecture() {
  const [selected, setSelected] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        setScale(Math.min(1, containerWidth / DIAGRAM_W))
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const handleSelect = useCallback((id: string) => {
    const dataKey = resolveDataKey(id)
    setSelected((prev) => (resolveDataKey(prev ?? '') === dataKey ? null : id))
  }, [])

  const handleSelectRelated = useCallback((dataKey: string) => {
    // Find the first box that matches this data key
    const box = BOXES.find((b) => resolveDataKey(b.id) === dataKey)
    if (box) {
      setSelected(box.id)
    }
  }, [])

  const selectedDataKey = selected ? resolveDataKey(selected) : null
  const selectedInfo = selectedDataKey ? COMPONENTS[selectedDataKey] ?? null : null

  return (
    <PageTransition>
      <div style={{ paddingTop: '140px', minHeight: '100vh', backgroundColor: WHITE }}>
        <div style={{ maxWidth: '1244px', margin: '0 auto', padding: '0 30px', paddingBottom: '80px' }}>
          {/* Header */}
          <div style={{ marginBottom: '12px' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: PURPLE,
              }}
            >
              Reference
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 300,
              fontSize: '48px',
              color: BLACK,
              margin: '0 0 16px',
              lineHeight: 1.15,
            }}
          >
            Architecture Explorer
          </h1>
          <p
            style={{
              fontSize: '18px',
              color: GRAY_600,
              maxWidth: '620px',
              lineHeight: 1.7,
              margin: '0 0 48px',
            }}
          >
            Click any component to learn what it does, how to configure it,
            and what happens when it fails.
          </p>

          {/* Main content: diagram + detail panel */}
          <div
            style={{
              display: 'flex',
              gap: '40px',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            {/* Diagram area - responsive scaling */}
            <div
              ref={containerRef}
              style={{
                width: '100%',
                maxWidth: DIAGRAM_W,
                flexShrink: 0,
                overflow: 'visible',
                height: DIAGRAM_H * scale,
              }}
            >
              <div
                style={{
                  width: DIAGRAM_W,
                  height: DIAGRAM_H,
                  position: 'relative',
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              >
                <ConnectionLines selected={selected} />
                <GroupLabels />
                {BOXES.map((box) => (
                  <ComponentBox
                    key={box.id}
                    box={box}
                    isSelected={
                      selectedDataKey !== null &&
                      resolveDataKey(box.id) === selectedDataKey
                    }
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </div>

            {/* Detail panel */}
            <div style={{ flex: '1 1 320px', minWidth: '300px' }}>
              <AnimatePresence mode="wait">
                {selectedInfo && (
                  <DetailPanel
                    key={selectedInfo.id}
                    info={selectedInfo}
                    onSelectRelated={handleSelectRelated}
                    onClose={() => setSelected(null)}
                  />
                )}
              </AnimatePresence>

              {!selectedInfo && (
                <div
                  style={{
                    padding: '32px',
                    borderRadius: '12px',
                    border: `2px dashed ${GRAY_200}`,
                    textAlign: 'center',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 600,
                      fontSize: '15px',
                      color: GRAY_400,
                      margin: '0 0 6px',
                    }}
                  >
                    Select a component
                  </p>
                  <p style={{ fontSize: '13px', color: GRAY_300, margin: 0 }}>
                    Click any box in the diagram to see its details,
                    configuration, and failure modes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
