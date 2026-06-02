import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  TrendingDown,
  AlertTriangle,
  WifiOff,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react'
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
const GRAY_100 = '#E0E0E0'
const GRAY_50 = '#F0F0F0'
const GREEN = '#2E7D32'
const GREEN_LIGHT = '#E8F5E9'

/* ------------------------------------------------------------------ */
/*  Decision tree data                                                 */
/* ------------------------------------------------------------------ */

interface TreeNode {
  id: string
  question: string
  options: { label: string; next: string }[]
}

interface SolutionNode {
  id: string
  solution: string
}

type Node = TreeNode | SolutionNode

function isSolution(node: Node): node is SolutionNode {
  return 'solution' in node
}

interface Symptom {
  id: string
  label: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>
  nodes: Record<string, Node>
  startId: string
}

const symptoms: Symptom[] = [
  {
    id: 'high-latency',
    label: 'High Latency',
    description: 'Requests are taking too long to complete',
    icon: Clock,
    startId: 'q1',
    nodes: {
      q1: {
        id: 'q1',
        question:
          'Is the high latency on the first token (TTFT) or throughout generation (ITL)?',
        options: [
          { label: 'TTFT is high', next: 'q2' },
          { label: 'ITL is high', next: 'q5' },
        ],
      },
      q2: {
        id: 'q2',
        question: 'Are you using prefix-cache-aware routing?',
        options: [
          { label: 'Yes', next: 'q3' },
          { label: 'No', next: 's1' },
        ],
      },
      s1: {
        id: 's1',
        solution:
          'Enable prefix-cache-aware routing. Add prefix-cache-scorer to your EPP config with weight 3.0. This can reduce TTFT by up to 2x by avoiding redundant prefill computation.',
      },
      q3: {
        id: 'q3',
        question: 'Is your cache hit rate above 50%?',
        options: [
          { label: 'Yes', next: 'q4' },
          { label: 'No', next: 's2' },
        ],
      },
      s2: {
        id: 's2',
        solution:
          'Your cache hit rate is low. Check that the KV Cache Indexer is running and syncing. Verify that your prefix-cache-scorer weight is high enough (recommended 3.0). Consider enabling tiered prefix caching to increase effective cache capacity.',
      },
      q4: {
        id: 'q4',
        question: 'Are your prefill workers saturated (queue depth > 10)?',
        options: [
          { label: 'Yes', next: 's3' },
          { label: 'No', next: 's4' },
        ],
      },
      s3: {
        id: 's3',
        solution:
          'Add more prefill workers or enable disaggregated serving to separate prefill from decode. Check if your prefill GPU utilization is near 100%. Consider increasing tensor parallelism for faster per-request prefill.',
      },
      s4: {
        id: 's4',
        solution:
          'Check your network latency between the router and model servers. Verify that the Envoy proxy timeout settings are not too conservative. Profile the prefill phase to identify bottlenecks.',
      },
      q5: {
        id: 'q5',
        question:
          'Are your decode workers saturated (high queue depth, near-full KV cache)?',
        options: [
          { label: 'Yes', next: 's5' },
          { label: 'No', next: 's6' },
        ],
      },
      s5: {
        id: 's5',
        solution:
          'Add more decode workers. Check KV cache utilization across replicas; if consistently above 90%, enable CPU or disk offloading to expand effective cache. Consider workload-variant autoscaling.',
      },
      s6: {
        id: 's6',
        solution:
          'Check for slow interconnects between prefill and decode workers (if disaggregated). Verify UCCL transport health. Monitor inter-token latency variance; high variance may indicate memory pressure.',
      },
    },
  },
  {
    id: 'low-throughput',
    label: 'Low Throughput',
    description: 'Not handling enough requests per second',
    icon: TrendingDown,
    startId: 'q1',
    nodes: {
      q1: {
        id: 'q1',
        question: 'Is the bottleneck on prefill or decode?',
        options: [
          { label: 'Prefill', next: 'q2' },
          { label: 'Decode', next: 'q3' },
          { label: 'Not sure', next: 's1' },
        ],
      },
      s1: {
        id: 's1',
        solution:
          'Check your EPP metrics. High prefill queue depth indicates prefill bottleneck. High decode queue depth indicates decode bottleneck. If both are high, you need more GPUs overall.',
      },
      q2: {
        id: 'q2',
        question: 'Are you using disaggregated serving?',
        options: [
          { label: 'Yes', next: 's2' },
          { label: 'No', next: 's3' },
        ],
      },
      s2: {
        id: 's2',
        solution:
          'Add more prefill workers. Check your prefill/decode ratio; the default 40/60 split may need adjustment for your workload. If your requests have very long prompts, shift more GPUs to prefill.',
      },
      s3: {
        id: 's3',
        solution:
          'Enable disaggregated serving. For models larger than 13B parameters, separating prefill and decode typically improves throughput by 30-70%. Start with a 40/60 prefill/decode split.',
      },
      q3: {
        id: 'q3',
        question:
          'Is KV cache utilization above 90% on most replicas?',
        options: [
          { label: 'Yes', next: 's4' },
          { label: 'No', next: 's5' },
        ],
      },
      s4: {
        id: 's4',
        solution:
          'Your decode workers are running out of cache space. Enable hierarchical KV offloading (CPU DRAM first, then disk). This can improve throughput up to 13.9x at high concurrency. Also check if enabling prefix-cache routing reduces redundant cache entries.',
      },
      s5: {
        id: 's5',
        solution:
          'Your decode GPUs have headroom. Check if memory bandwidth is the bottleneck (monitor GPU memory bandwidth utilization). Consider upgrading to GPUs with higher memory bandwidth (H200, B200) or adding more replicas.',
      },
    },
  },
  {
    id: 'oom-errors',
    label: 'OOM Errors',
    description: 'Pods are running out of memory and crashing',
    icon: AlertTriangle,
    startId: 'q1',
    nodes: {
      q1: {
        id: 'q1',
        question: 'Which component is OOMing?',
        options: [
          { label: 'Model server pods', next: 'q2' },
          { label: 'EPP/Router pods', next: 's1' },
          { label: 'Not sure', next: 's2' },
        ],
      },
      s1: {
        id: 's1',
        solution:
          'Increase EPP memory limits. If using flow control with large queues, increase maxBytes in your flow control config. Typical EPP pods need 2-4GB for most workloads.',
      },
      s2: {
        id: 's2',
        solution:
          'Check pod events with kubectl describe pod. Look for OOMKilled in the container status. The terminated container\'s name tells you which component failed.',
      },
      q2: {
        id: 'q2',
        question: 'Is the model too large for your GPUs?',
        options: [
          { label: 'Yes', next: 's3' },
          { label: 'No', next: 'q3' },
        ],
      },
      s3: {
        id: 's3',
        solution:
          'Increase tensor parallelism to distribute the model across more GPUs. For a 70B model, use at least 4x 80GB GPUs (TP=4). For 405B, use 8x GPUs minimum. Alternatively, use quantization (FP8, AWQ) to reduce memory requirements.',
      },
      q3: {
        id: 'q3',
        question: 'Is KV cache using too much GPU memory?',
        options: [
          { label: 'Yes', next: 's4' },
          { label: 'No', next: 's5' },
        ],
      },
      s4: {
        id: 's4',
        solution:
          'Reduce gpu-memory-utilization from the default 0.9 to 0.85 or 0.8. Enable CPU offloading to move cold cache entries off-GPU. Set max-model-len to limit the maximum context length accepted.',
      },
      s5: {
        id: 's5',
        solution:
          'Check for memory leaks. Monitor GPU memory over time. If memory grows without bound, restart the affected pods and file a bug report. Check if you are running the latest version of vLLM.',
      },
    },
  },
  {
    id: 'connection-issues',
    label: 'Connection Issues',
    description: 'Requests failing to reach the model servers',
    icon: WifiOff,
    startId: 'q1',
    nodes: {
      q1: {
        id: 'q1',
        question: 'Are requests reaching the Envoy proxy?',
        options: [
          { label: 'Yes', next: 'q2' },
          { label: 'No', next: 's1' },
        ],
      },
      s1: {
        id: 's1',
        solution:
          'Check your Kubernetes Service and Ingress configuration. Verify the proxy pod is running and healthy. Check that your client is using the correct endpoint URL and port.',
      },
      q2: {
        id: 'q2',
        question: 'Is the EPP responding to the proxy?',
        options: [
          { label: 'Yes', next: 'q3' },
          { label: 'No', next: 's2' },
        ],
      },
      s2: {
        id: 's2',
        solution:
          'Check EPP pod logs for errors. Verify the ext-proc gRPC connection between Envoy and EPP. Check that the EPP config file is valid YAML. Restart the EPP pod if needed.',
      },
      q3: {
        id: 'q3',
        question:
          'Are model server pods registered with the InferencePool?',
        options: [
          { label: 'Yes', next: 's3' },
          { label: 'No', next: 's4' },
        ],
      },
      s3: {
        id: 's3',
        solution:
          'Check model server pod readiness probes. Verify the pods are fully loaded (model loading can take several minutes for large models). Check EPP logs for endpoint health check failures.',
      },
      s4: {
        id: 's4',
        solution:
          'Verify your InferencePool selector labels match the labels on your model server pods. Check that the target port in the InferencePool matches the model server\'s serving port. Run kubectl get inferencepool to verify the resource exists.',
      },
    },
  },
]

/* ------------------------------------------------------------------ */
/*  Path entry (a completed step in the journey)                       */
/* ------------------------------------------------------------------ */

interface PathEntry {
  nodeId: string
  question: string
  answer: string
}

/* ------------------------------------------------------------------ */
/*  Symptom Card                                                       */
/* ------------------------------------------------------------------ */

function SymptomCard({
  symptom,
  selected,
  onClick,
}: {
  symptom: Symptom
  selected: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const Icon = symptom.icon

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '36px 24px',
        backgroundColor: selected ? PURPLE_LIGHT : '#fff',
        border: selected
          ? `2px solid ${PURPLE}`
          : `2px solid ${hovered ? GRAY_300 : GRAY_200}`,
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        position: 'relative',
        top: hovered && !selected ? '-2px' : '0',
        boxShadow:
          hovered && !selected ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
        fontFamily: 'var(--font-body)',
        width: '100%',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: selected ? PURPLE : GRAY_50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          transition: 'background-color 0.25s ease',
        }}
      >
        <Icon
          size={28}
          style={{
            color: selected ? '#fff' : PURPLE,
            transition: 'color 0.25s ease',
          }}
        />
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '18px',
          color: BLACK,
          marginBottom: '8px',
        }}
      >
        {symptom.label}
      </div>
      <div
        style={{
          fontSize: '14px',
          lineHeight: '22px',
          color: GRAY_600,
        }}
      >
        {symptom.description}
      </div>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Completed step in the timeline                                     */
/* ------------------------------------------------------------------ */

function CompletedStep({
  entry,
  index,
}: {
  entry: PathEntry
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '0',
      }}
    >
      {/* Timeline connector */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
          width: '32px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: PURPLE_LIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '13px',
            color: PURPLE,
            flexShrink: 0,
          }}
        >
          {index + 1}
        </div>
        <div
          style={{
            width: '2px',
            flex: 1,
            backgroundColor: GRAY_200,
            minHeight: '20px',
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          paddingBottom: '24px',
          opacity: 0.65,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            lineHeight: '24px',
            color: GRAY_600,
            marginBottom: '6px',
          }}
        >
          {entry.question}
        </div>
        <div
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            backgroundColor: PURPLE_LIGHT,
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '13px',
            color: PURPLE_DARK,
            borderRadius: '3px',
          }}
        >
          {entry.answer}
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Current question step                                              */
/* ------------------------------------------------------------------ */

function CurrentQuestion({
  node,
  stepIndex,
  onAnswer,
}: {
  node: TreeNode
  stepIndex: number
  onAnswer: (optionLabel: string, nextId: string) => void
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        display: 'flex',
        gap: '16px',
      }}
    >
      {/* Timeline dot */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
          width: '32px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: PURPLE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '13px',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {stepIndex + 1}
        </div>
      </div>

      {/* Question content */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '18px',
            lineHeight: '28px',
            color: BLACK,
            marginBottom: '20px',
          }}
        >
          {node.question}
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {node.options.map((opt, i) => (
            <button
              key={opt.label}
              onClick={() => onAnswer(opt.label, opt.next)}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                padding: '12px 24px',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '14px',
                letterSpacing: '0.02em',
                color: hoveredIdx === i ? '#fff' : PURPLE,
                backgroundColor:
                  hoveredIdx === i ? PURPLE : '#fff',
                border: `2px solid ${PURPLE}`,
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Solution card                                                      */
/* ------------------------------------------------------------------ */

function SolutionCard({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex',
        gap: '16px',
      }}
    >
      {/* Timeline dot (green) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
          width: '32px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: GREEN,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CheckCircle2 size={18} style={{ color: '#fff' }} />
        </div>
      </div>

      {/* Solution card */}
      <div
        style={{
          flex: 1,
          padding: '24px 28px',
          backgroundColor: GREEN_LIGHT,
          borderLeft: `4px solid ${GREEN}`,
          borderRadius: '0 4px 4px 0',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '14px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: GREEN,
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} />
          Solution
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '16px',
            lineHeight: '28px',
            color: BLACK,
          }}
        >
          {text}
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Decision Tree component                                            */
/* ------------------------------------------------------------------ */

function DecisionTree({
  symptom,
  onStartOver,
}: {
  symptom: Symptom
  onStartOver: () => void
}) {
  const [currentNodeId, setCurrentNodeId] = useState(symptom.startId)
  const [path, setPath] = useState<PathEntry[]>([])

  const currentNode = symptom.nodes[currentNodeId]

  const handleAnswer = useCallback(
    (answerLabel: string, nextId: string) => {
      const node = symptom.nodes[currentNodeId]
      if (!isSolution(node)) {
        setPath((prev) => [
          ...prev,
          {
            nodeId: currentNodeId,
            question: node.question,
            answer: answerLabel,
          },
        ])
      }
      setCurrentNodeId(nextId)
    },
    [currentNodeId, symptom.nodes],
  )

  const handleReset = useCallback(() => {
    setCurrentNodeId(symptom.startId)
    setPath([])
  }, [symptom.startId])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ marginTop: '48px' }}
    >
      {/* Section label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            height: '2px',
            width: '32px',
            backgroundColor: PURPLE,
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: PURPLE,
          }}
        >
          Diagnosing: {symptom.label}
        </span>
      </div>

      {/* Timeline of completed steps */}
      <AnimatePresence>
        {path.map((entry, i) => (
          <CompletedStep key={entry.nodeId} entry={entry} index={i} />
        ))}
      </AnimatePresence>

      {/* Current node: either a question or a solution */}
      <AnimatePresence mode="wait">
        {isSolution(currentNode) ? (
          <SolutionCard key={currentNode.id} text={currentNode.solution} />
        ) : (
          <CurrentQuestion
            key={currentNode.id}
            node={currentNode}
            stepIndex={path.length}
            onAnswer={handleAnswer}
          />
        )}
      </AnimatePresence>

      {/* Start Over button */}
      <div
        style={{
          marginTop: '40px',
          paddingTop: '24px',
          borderTop: `1px solid ${GRAY_100}`,
          display: 'flex',
          gap: '12px',
        }}
      >
        <StartOverButton onClick={handleReset} label="Restart Diagnosis" />
        <StartOverButton onClick={onStartOver} label="Choose Another Symptom" secondary />
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Start Over Button                                                  */
/* ------------------------------------------------------------------ */

function StartOverButton({
  onClick,
  label,
  secondary,
}: {
  onClick: () => void
  label: string
  secondary?: boolean
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
        padding: '12px 24px',
        backgroundColor: secondary
          ? 'transparent'
          : hovered
            ? BLACK
            : 'transparent',
        color: secondary
          ? hovered
            ? BLACK
            : GRAY_600
          : hovered
            ? '#fff'
            : BLACK,
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '14px',
        letterSpacing: '0.03em',
        border: secondary
          ? `2px solid ${hovered ? GRAY_400 : GRAY_300}`
          : `2px solid ${hovered ? BLACK : '#3C3F42'}`,
        borderRadius: '0',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
    >
      <RotateCcw size={14} />
      {label}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function Troubleshooting() {
  const [selectedSymptom, setSelectedSymptom] = useState<Symptom | null>(null)

  const handleSelectSymptom = useCallback((symptom: Symptom) => {
    setSelectedSymptom(symptom)
  }, [])

  const handleStartOver = useCallback(() => {
    setSelectedSymptom(null)
  }, [])

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
              Reference
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
              Troubleshooting
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
              Start with your symptom. Follow the steps. Find the fix.
            </p>
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            maxWidth: '1244px',
            margin: '0 auto',
            padding: '48px 30px 80px',
          }}
        >
          {/* Symptom selector */}
          <div style={{ marginBottom: '16px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '28px',
                color: BLACK,
                marginBottom: '8px',
              }}
            >
              What are you experiencing?
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                lineHeight: '26px',
                color: GRAY_600,
                marginBottom: '28px',
                maxWidth: '640px',
              }}
            >
              Select the symptom that best describes your issue. We will walk you
              through a series of diagnostic questions to pinpoint the cause.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '16px',
            }}
          >
            {symptoms.map((symptom) => (
              <SymptomCard
                key={symptom.id}
                symptom={symptom}
                selected={selectedSymptom?.id === symptom.id}
                onClick={() => handleSelectSymptom(symptom)}
              />
            ))}
          </div>

          {/* Decision tree */}
          <AnimatePresence mode="wait">
            {selectedSymptom && (
              <DecisionTree
                key={selectedSymptom.id}
                symptom={selectedSymptom}
                onStartOver={handleStartOver}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  )
}
