import { useState, useRef, useEffect, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageTransition from '../components/shared/PageTransition'
import Term from '../components/shared/Term'
import Expand from '../components/shared/Expand'
import InteractiveFlow from '../components/shared/InteractiveFlow'

/* ─── Helper Components ─── */

function Section({ title, id, children }: { title: string; id?: string; children: ReactNode }) {
  return (
    <div id={id} style={{ marginBottom: '56px', scrollMarginTop: '100px' }}>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 700,
          color: '#151515',
          marginBottom: '20px',
          lineHeight: '36px',
        }}
      >
        {title}
      </h3>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '18px',
          lineHeight: '32px',
          color: '#212121',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function KeyConcept({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: '#F0F0F0',
        padding: '20px 24px',
        marginBottom: '16px',
        borderRadius: '4px',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: '18px',
          color: '#151515',
        }}
      >
        {term}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '18px',
          lineHeight: '32px',
          color: '#212121',
          marginLeft: '8px',
        }}
      >
        {children}
      </span>
    </div>
  )
}

function ComparisonTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: string[][]
}) {
  return (
    <div style={{ overflowX: 'auto', margin: '24px 0' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'var(--font-body)',
          fontSize: '15px',
          lineHeight: '24px',
        }}
      >
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  backgroundColor: '#151515',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '14px',
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #E0E0E0',
                    backgroundColor: ri % 2 === 0 ? '#fff' : '#F0F0F0',
                    color: '#212121',
                    verticalAlign: 'top',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MonoDiagram({ lines }: { lines: string[] }) {
  return (
    <pre
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        lineHeight: '22px',
        backgroundColor: '#151515',
        color: '#D2D2D2',
        padding: '28px 24px',
        overflowX: 'auto',
        borderRadius: '4px',
        margin: '24px 0',
      }}
    >
      {lines.join('\n')}
    </pre>
  )
}

/* ─── Section Configuration ─── */

const sections = [
  { id: 'big-picture', label: 'The Big Picture' },
  { id: 'inference-basics', label: 'How Inference Works' },
  { id: 'disaggregation', label: 'Disaggregation' },
  { id: 'router', label: 'The Router' },
  { id: 'routing-policies', label: 'Routing Policies' },
  { id: 'kv-cache', label: 'KV Cache Architecture' },
  { id: 'kubernetes', label: 'Kubernetes Integration' },
  { id: 'production', label: 'Autoscaling & Production' },
] as const

/* ─── Main Page ─── */

export default function ArchitectureDeepDive() {
  const [activeSection, setActiveSection] = useState<string>('big-picture')
  const [showSidebar, setShowSidebar] = useState(false)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  /* Track window width for sidebar visibility */
  useEffect(() => {
    const checkWidth = () => setShowSidebar(window.innerWidth > 1024)
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  /* IntersectionObserver to highlight the active sidebar link */
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    sections.forEach(({ id }) => {
      const el = sectionRefs.current[id]
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id)
          }
        },
        { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  const registerRef = (id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el
  }

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
        {/* Header */}
        <div style={{ backgroundColor: '#151515', padding: '120px 24px 48px', marginBottom: '48px' }}>
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: '#9b4d9b',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              Reference Guide
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '48px',
                fontWeight: 700,
                color: '#fff',
                lineHeight: '56px',
                marginBottom: '16px',
              }}
            >
              Architecture Deep Dive
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '20px',
                color: '#B0B0B0',
                lineHeight: '32px',
              }}
            >
              A comprehensive walkthrough of how llm&#x2011;d works under the hood. From request routing to KV cache management, every component explained.
            </p>
          </div>
        </div>

        {/* Layout: sidebar + content */}
        <div
          style={{
            display: 'flex',
            gap: '48px',
            maxWidth: '1244px',
            margin: '0 auto',
            padding: '0 24px',
          }}
        >
          {/* Sticky sidebar */}
          {showSidebar && (
            <motion.nav
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                width: '220px',
                flexShrink: 0,
                position: 'sticky',
                top: '80px',
                alignSelf: 'flex-start',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#8A8D90',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '16px',
                }}
              >
                On this page
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {sections.map(({ id, label }) => (
                  <li key={id} style={{ marginBottom: '4px' }}>
                    <a
                      href={`#${id}`}
                      onClick={(e) => {
                        e.preventDefault()
                        const el = sectionRefs.current[id]
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth' })
                        }
                      }}
                      style={{
                        display: 'block',
                        padding: '8px 12px',
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        fontWeight: activeSection === id ? 700 : 400,
                        color: activeSection === id ? '#9b4d9b' : '#4D4D4D',
                        textDecoration: 'none',
                        borderLeft: activeSection === id ? '3px solid #9b4d9b' : '3px solid transparent',
                        transition: 'all 0.2s ease',
                        lineHeight: '20px',
                      }}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.nav>
          )}

          {/* Main content */}
          <div style={{ flex: 1, maxWidth: '820px', paddingBottom: '80px' }}>

            {/* ─── SECTION 1: The Big Picture ─── */}
            <div ref={registerRef('big-picture')}>
              <Section title="The Big Picture" id="big-picture">
                <p style={{ marginBottom: '20px' }}>
                  At its core, llm&#x2011;d is a system that makes LLM inference on Kubernetes faster and cheaper by being smart about how it routes requests and manages GPU resources.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  Rather than treating every GPU pod as interchangeable (the way a basic load balancer would), llm&#x2011;d understands the internal state of each pod. It knows which pods have relevant data cached in memory, which ones have the shortest queues, and which ones are best equipped to handle the next request quickly. This awareness lets it make routing decisions that avoid redundant computation and reduce latency.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  The system is built from composable pieces. You can run the router on its own for smarter load balancing, add disaggregated prefill and decode workers for better hardware utilization, layer on a hierarchical KV cache for cross-request data reuse, and plug in an autoscaler that understands inference workloads. Each piece adds value independently, and they work together to form a complete serving platform.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  Here is the full lifecycle of a request through llm&#x2011;d, from the moment it arrives to the moment the response streams back:
                </p>
                <InteractiveFlow
                  steps={[
                    {
                      title: 'Client sends a request',
                      detail:
                        'A user or application sends a chat completion request to the llm‑d endpoint. This looks like any standard OpenAI-compatible API call.',
                    },
                    {
                      title: 'Request hits the Gateway',
                      detail:
                        'The request arrives at the gateway layer (Envoy or AgentGateway), which acts as the front door. It handles TLS, rate limiting, and forwards the request to the router.',
                    },
                    {
                      title: 'Router scores available backends',
                      detail:
                        'The Endpoint Picker (EPP) evaluates all available model server pods. It checks which ones have relevant KV cache data, current queue depth, and predicted latency.',
                    },
                    {
                      title: 'Router picks the best pod',
                      detail:
                        'Based on the scoring, the router selects the pod that will handle this request most efficiently. For follow-up messages, this is usually the pod that already has the conversation cached.',
                    },
                    {
                      title: 'Prefill phase runs',
                      detail:
                        'The selected pod processes all input tokens in parallel. This is the compute-heavy step that benefits from GPU FLOPS.',
                    },
                    {
                      title: 'Decode phase generates tokens',
                      detail:
                        'The pod generates output tokens one at a time, streaming them back. This phase is memory-bandwidth bound, not compute bound.',
                    },
                    {
                      title: 'KV cache is stored',
                      detail:
                        'The computed key-value pairs from this request are stored in the cache hierarchy. Future requests with the same prefix can skip recomputation.',
                    },
                    {
                      title: 'Response streams back to client',
                      detail:
                        'The generated tokens stream back through the gateway to the client in real time.',
                    },
                  ]}
                />
                <p style={{ marginTop: '20px' }}>
                  Every component in this pipeline is designed to run on{' '}
                  <Term definition="An open source container orchestration platform that automates deploying, scaling, and managing containerized applications across clusters of machines.">Kubernetes</Term>,
                  using standard primitives like Deployments, StatefulSets, and Custom Resource Definitions. If you already run workloads on Kubernetes, llm&#x2011;d fits into your existing infrastructure and tooling.
                </p>
              </Section>
            </div>

            {/* ─── SECTION 2: How LLM Inference Actually Works ─── */}
            <div ref={registerRef('inference-basics')}>
              <Section title="How LLM inference actually works" id="inference-basics">
                <p style={{ marginBottom: '20px' }}>
                  Before diving into llm&#x2011;d's architecture, it helps to understand what happens when you send text to a large language model. The process has several distinct stages, and understanding them is key to understanding why llm&#x2011;d is designed the way it is.
                </p>

                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#151515', marginBottom: '14px', marginTop: '32px' }}>
                  Tokenization
                </h4>
                <p style={{ marginBottom: '20px' }}>
                  The model does not work with raw text. Instead, it breaks your input into{' '}
                  <Term definition="A word or sub-word unit that the model processes. Text is split into tokens before being fed to the model. For example, the word 'unhappiness' might become three tokens: 'un', 'happi', 'ness'.">tokens</Term>,
                  which are small pieces of text (sometimes whole words, sometimes fragments). The sentence "What is Kubernetes?" might become six tokens: "What", " is", " Kub", "ern", "etes", "?". Each token is mapped to a numerical ID that the model can process.
                </p>

                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#151515', marginBottom: '14px', marginTop: '32px' }}>
                  The transformer forward pass
                </h4>
                <p style={{ marginBottom: '20px' }}>
                  Once tokenized, the input passes through a{' '}
                  <Term definition="The neural network architecture used by modern large language models. It processes input through a series of layers, each containing attention and feed-forward computations, to produce predictions about the next token.">transformer</Term>{' '}
                  network. This network is made up of many layers stacked on top of each other (a model like Llama 3 70B has 80 layers). Each layer performs two main operations. First, an{' '}
                  <Term definition="A mechanism in transformer models that lets the model weigh the importance of different tokens relative to each other. It computes query, key, and value vectors for each token and uses their interactions to determine how much each token should influence the representation of every other token.">attention</Term>{' '}
                  mechanism lets every token look at every other token in the input, figuring out which parts of the context matter most. Second, a feed-forward network processes each token's representation independently.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  The attention step is where the model captures relationships between words. When processing the word "it" in a sentence, the attention mechanism figures out what "it" refers to by comparing it against all other tokens. This comparison produces two important data structures: the <strong>key</strong> and <strong>value</strong> vectors for each token. These are stored in what is called the KV cache, and they become critical for efficiency.
                </p>

                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#151515', marginBottom: '14px', marginTop: '32px' }}>
                  Two phases of inference
                </h4>
                <p style={{ marginBottom: '20px' }}>
                  LLM inference happens in two distinct phases, and each has very different hardware requirements. Understanding this split is fundamental to understanding llm&#x2011;d's architecture.
                </p>

                <KeyConcept term="Prefill">
                  The first phase, where the model processes all input tokens at once. Every token in your prompt is fed through the entire model in a single pass. This generates the KV cache entries for all input tokens and produces the first output token. Prefill is compute-bound: the bottleneck is how fast the GPU can perform matrix multiplications. More{' '}
                  <Term definition="Floating Point Operations Per Second. A measure of how fast a processor can perform mathematical calculations.">FLOPS</Term>{' '}
                  means faster prefill.
                </KeyConcept>

                <KeyConcept term="Decode">
                  The second phase, where the model generates output tokens one at a time. For each new token, the model reads the entire KV cache from memory to compute attention against all previous tokens, then produces just one new token. Decode is memory-bandwidth-bound: the bottleneck is how fast data can be read from GPU memory, not how fast the GPU can compute. Higher memory bandwidth (measured in TB/s) means faster token generation.
                </KeyConcept>

                <p style={{ marginBottom: '20px' }}>
                  Two latency metrics capture the user experience of these phases.{' '}
                  <Term definition="Time to First Token. The time between sending a request and receiving the first token of the response. This is dominated by the prefill phase.">TTFT</Term>{' '}
                  (time to first token) measures how long it takes for the first token to appear, which is dominated by the prefill phase.{' '}
                  <Term definition="Inter-Token Latency. The time between consecutive output tokens during the decode phase. Lower ITL means the response streams faster.">ITL</Term>{' '}
                  (inter-token latency) measures the gap between consecutive output tokens, which reflects decode performance.
                </p>

                <MonoDiagram
                  lines={[
                    'Input: "What is Kubernetes?"',
                    '',
                    'Tokenizer:  ["What", " is", " Kub", "ern", "etes", "?"]',
                    '               |      |      |      |      |      |',
                    '               v      v      v      v      v      v',
                    'Prefill:   [All tokens processed in parallel]  --> KV Cache stored',
                    '                                                     |',
                    'Decode:    Token 1 --> Token 2 --> Token 3 --> ...  (one at a time)',
                    '           "It"       " is"       " an"',
                  ]}
                />

                <p style={{ marginBottom: '20px' }}>
                  Notice the fundamental asymmetry. Prefill processes many tokens at once, doing a large amount of computation in a single step. Decode processes one token per step, but must read a growing amount of cached data each time. This asymmetry is why running both phases on the same hardware creates inefficiencies, and it is the core motivation for llm&#x2011;d's disaggregated architecture.
                </p>

                <Expand label="Why does this split matter for hardware?">
                  <p style={{ marginBottom: '16px' }}>
                    Think about two different tasks: multiplying large matrices (prefill) versus reading a large table from memory over and over (decode). The first task benefits from a processor with fast arithmetic units. The second task benefits from a processor with fast memory access.
                  </p>
                  <p style={{ marginBottom: '16px' }}>
                    Modern GPUs are designed for both, but they have a fixed ratio of compute to memory bandwidth. When prefill and decode run on the same GPU, they compete for the same resources. A long prefill (from a large prompt) stalls the decode loop for all in-flight requests, causing latency spikes. A decode-heavy workload leaves most of the GPU's compute power idle.
                  </p>
                  <p>
                    By separating the two phases onto different hardware, each can be optimized independently. Prefill workers can be tuned for maximum throughput (larger batch sizes, higher utilization). Decode workers can be tuned for minimum latency (smaller batches, lower queue depth). This is the core idea behind disaggregated inference.
                  </p>
                </Expand>
              </Section>
            </div>

            {/* ─── SECTION 3: Prefill/Decode Disaggregation ─── */}
            <div ref={registerRef('disaggregation')}>
              <Section title="Prefill/decode disaggregation" id="disaggregation">
                <p style={{ marginBottom: '20px' }}>
                  In a traditional LLM serving setup, a single GPU pod handles both prefill and decode for every request. The pod processes the input prompt (prefill), then generates tokens one at a time (decode), all on the same GPU. This is simple to deploy, but it creates a fundamental conflict: the two phases have opposite hardware profiles, and they compete for the same resources.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  When a large prompt arrives for prefill, it monopolizes the GPU's compute units. Any requests currently in the decode phase on that same GPU are stalled until prefill finishes, causing their inter-token latency to spike. Conversely, when decode work dominates, the GPU's raw compute power sits underutilized because decode is bottlenecked on memory reads, not arithmetic.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  llm&#x2011;d solves this by running prefill and decode as separate workloads, each with its own pool of GPU pods:
                </p>

                <MonoDiagram
                  lines={[
                    'Traditional (coupled):',
                    '┌─────────────────────────────┐',
                    '│  Single GPU Pod             │',
                    '│  Prefill + Decode together  │',
                    '│  Competing for resources    │',
                    '└─────────────────────────────┘',
                    '',
                    'llm-d (disaggregated):',
                    '┌───────────────┐    KV Transfer    ┌───────────────┐',
                    '│ Prefill Worker │ ──────────────> │ Decode Worker  │',
                    '│ High FLOPS    │                  │ High Bandwidth │',
                    '│ Batch prefills│                  │ Stream tokens  │',
                    '└───────────────┘                  └───────────────┘',
                  ]}
                />

                <p style={{ marginBottom: '20px' }}>
                  <strong>Prefill workers</strong> are optimized for compute throughput. They receive incoming requests, process the entire input prompt through the model in parallel, and produce the KV cache entries for that prompt. These workers benefit from GPUs with the highest FLOPS (like NVIDIA B200). They can batch multiple prefill requests together for maximum compute utilization.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  <strong>Decode workers</strong> are optimized for memory bandwidth. They receive the KV cache from the prefill phase and generate output tokens one at a time, streaming them back to the client. These workers benefit from GPUs with high HBM bandwidth. Because decode is latency-sensitive (users are watching tokens appear in real time), decode workers typically run with smaller batch sizes to keep inter-token latency low.
                </p>

                <KeyConcept term="KV Transfer">
                  After prefill completes, the computed key-value pairs must move from the prefill worker to the decode worker. This transfer happens over the network (or through shared memory when workers are co-located). The size of the transfer depends on the model architecture and the number of input tokens. For a 70B parameter model with a 4,000-token prompt, the KV cache might be several hundred megabytes. llm&#x2011;d optimizes this transfer using efficient serialization and, where available, RDMA for direct GPU-to-GPU data movement.
                </KeyConcept>

                <p style={{ marginBottom: '20px' }}>
                  The benefits of disaggregation are measurable. In validated deployments, a 16 prefill + 16 decode B200 GPU configuration sustains over 50,000 output tokens per second. Each pool scales independently: if you see a burst of new requests (prefill-heavy), you scale up prefill workers without touching the decode pool. If your workload shifts to long outputs (decode-heavy), you scale up decode workers instead.
                </p>

                <Expand label="What if I only have one type of GPU?">
                  <p style={{ marginBottom: '16px' }}>
                    Disaggregation is entirely optional, and llm&#x2011;d works well in coupled mode where prefill and decode run on the same GPU. You do not need heterogeneous hardware to benefit from disaggregation.
                  </p>
                  <p style={{ marginBottom: '16px' }}>
                    Even with identical GPUs, disaggregation helps because it eliminates contention between phases. Prefill requests never interrupt in-flight decode work, which stabilizes inter-token latency. And independent scaling still applies: you can have different numbers of prefill and decode replicas based on your workload mix.
                  </p>
                  <p>
                    If disaggregation adds more complexity than your use case warrants, you can start with coupled mode and add disaggregation later. The router, KV cache, and autoscaler all work the same way regardless of whether inference is disaggregated.
                  </p>
                </Expand>
              </Section>
            </div>

            {/* ─── SECTION 4: The Router ─── */}
            <div ref={registerRef('router')}>
              <Section title="The router: how requests find the right pod" id="router">
                <p style={{ marginBottom: '20px' }}>
                  The router is the brain of llm&#x2011;d. While a traditional load balancer distributes requests using simple strategies like round-robin or least-connections, the llm&#x2011;d router makes decisions based on deep knowledge of each pod's internal state: what data is cached, how long the queue is, and how fast the pod is likely to respond.
                </p>

                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#151515', marginBottom: '14px', marginTop: '32px' }}>
                  Two-layer architecture
                </h4>
                <p style={{ marginBottom: '20px' }}>
                  The routing system has two layers. The first is a gateway, either{' '}
                  <Term definition="A high-performance open source edge and service proxy designed for cloud-native applications. It handles TLS termination, rate limiting, and request routing.">Envoy</Term>{' '}
                  or AgentGateway, which acts as the front door. It handles TLS termination, rate limiting, authentication, and the mechanics of forwarding HTTP requests.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  The second layer is the <strong>Endpoint Picker (EPP)</strong>, which is the intelligence behind routing decisions. The gateway delegates pod selection to the EPP using a protocol called{' '}
                  <Term definition="External Processing. A protocol where Envoy sends request metadata to an external service for additional processing or routing decisions before forwarding the request to a backend.">ext-proc</Term>{' '}
                  (external processing). For each incoming request, the gateway sends the request headers and body to the EPP. The EPP evaluates all available pods, selects the best one, and tells the gateway where to forward the request.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  This separation is deliberate. The gateway handles the high-throughput, low-latency work of proxying HTTP connections. The EPP handles the stateful, inference-aware work of scoring and selecting pods. Each can be scaled, updated, and debugged independently.
                </p>

                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#151515', marginBottom: '14px', marginTop: '32px' }}>
                  The scoring pipeline
                </h4>
                <p style={{ marginBottom: '20px' }}>
                  When a request arrives, the EPP runs it through a three-stage pipeline: <strong>Filter</strong>, <strong>Score</strong>, and <strong>Pick</strong>.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  In the <strong>Filter</strong> stage, the EPP removes any pods that cannot serve this request. This includes pods that are unhealthy, pods that do not have the required model loaded, and pods that have been marked for draining. Only healthy, ready pods proceed to scoring.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  In the <strong>Score</strong> stage, each remaining pod is evaluated by multiple scorers. Each scorer measures a different dimension of fitness for this particular request. The scores are combined (using configurable weights) into a single composite score per pod.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  In the <strong>Pick</strong> stage, the pod with the highest composite score wins the request. If multiple pods are tied, the picker can use a secondary strategy (like random selection among the tied pods) to break the tie.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  Here are the primary scorers and what they measure:
                </p>

                <KeyConcept term="prefix-cache-scorer">
                  Scores pods based on how much of the request's prefix is already in their KV cache. Higher cache overlap means less recomputation. If a pod already has the system prompt and the first three turns of a conversation cached, it can skip that work entirely and jump straight to processing the new message. This scorer queries the Global Prefix Index to determine cache state across all pods.
                </KeyConcept>

                <KeyConcept term="kv-cache-utilization-scorer">
                  Favors pods with more free KV cache space. Avoids sending requests to pods that are almost out of cache memory. When a pod's KV cache is nearly full, new requests may trigger cache eviction, which forces future requests to recompute data that was previously cached. Routing away from full pods preserves existing cache entries.
                </KeyConcept>

                <KeyConcept term="queue-depth-scorer">
                  Prefers pods with shorter request queues. Balances load across the pool. A pod with a deep queue will take longer to start processing a new request because the new request must wait behind all queued requests. This scorer prevents hot spots where one pod accumulates a backlog while others sit idle.
                </KeyConcept>

                <KeyConcept term="session-affinity-scorer">
                  Keeps multi-turn conversations on the same pod when possible, maximizing cache reuse. When a user sends a follow-up message in a conversation, the pod that handled the previous turn almost certainly has the conversation history cached. Routing the follow-up to the same pod avoids recomputing all previous turns from scratch.
                </KeyConcept>

                <p style={{ marginBottom: '20px' }}>
                  Here is the full flow of a request through the scoring pipeline:
                </p>

                <InteractiveFlow
                  steps={[
                    {
                      title: 'Request arrives at EPP',
                      detail:
                        'The gateway forwards the request metadata (headers, body, model name) to the Endpoint Picker via ext-proc. The EPP parses the request to extract the token sequence, conversation ID, and any routing hints.',
                    },
                    {
                      title: 'Filter: Remove unhealthy pods',
                      detail:
                        'Pods that are not ready or have the wrong model are excluded. This step also removes pods that are being drained for maintenance, pods that have failed recent health checks, and pods whose model version does not match the request.',
                    },
                    {
                      title: 'Score: Evaluate remaining pods',
                      detail:
                        'Each scorer assigns a score between 0 and 1. For example, the prefix cache scorer might give Pod 2 a score of 0.9 (because 90% of the request prefix is cached there) while Pod 1 gets 0.3. The queue depth scorer might favor Pod 1 if it has a shorter queue. The scores are combined using configured weights.',
                    },
                    {
                      title: 'Pick: Select highest-scoring pod',
                      detail:
                        'The pod with the best combined score wins the request. The EPP tells the gateway to forward the request to that pod. The entire scoring process typically completes in under a millisecond.',
                    },
                  ]}
                />

                <Expand label="How do scheduling profiles work?">
                  <p style={{ marginBottom: '16px' }}>
                    A scheduling profile is a named configuration that combines scorers with different weights to optimize for a specific use case. For example, a "low-latency" profile might weight the prefix-cache-scorer and predicted-latency-scorer heavily, while a "high-throughput" profile might weight queue-depth-scorer and kv-cache-utilization-scorer more heavily.
                  </p>
                  <p style={{ marginBottom: '16px' }}>
                    Profiles are defined in the EPP configuration and can be switched without restarting the router. This lets operators adjust routing behavior based on the time of day, the type of traffic, or the current performance characteristics of the cluster.
                  </p>
                  <p>
                    You can also define custom scorers by implementing a simple interface. This is useful when your workload has domain-specific routing requirements, such as preferring pods in a particular availability zone or routing based on request metadata.
                  </p>
                </Expand>
              </Section>
            </div>

            {/* ─── SECTION 5: Routing Policies Compared ─── */}
            <div ref={registerRef('routing-policies')}>
              <Section title="Routing policies compared" id="routing-policies">
                <p style={{ marginBottom: '20px' }}>
                  llm&#x2011;d ships with several built-in routing policies, each optimized for a different type of workload. Choosing the right policy depends on your traffic patterns, latency requirements, and infrastructure. Here is a comparison of the main options:
                </p>

                <ComparisonTable
                  headers={['Policy', 'Best for', 'How it works', 'Trade-off']}
                  rows={[
                    [
                      'prefix-cache-aware',
                      'Multi-turn conversations, chatbots',
                      'Routes to the pod with the most prefix cache overlap for this request',
                      'May create hot spots if one conversation is very active',
                    ],
                    [
                      'load-aware',
                      'High-throughput batch processing',
                      'Routes to the pod with the shortest queue and most available resources',
                      'Does not consider cache state, may cause cache misses',
                    ],
                    [
                      'predicted-latency',
                      'Latency-sensitive applications',
                      'Estimates time-to-first-token for each pod and picks the fastest',
                      'Requires latency predictor model to be accurate',
                    ],
                    [
                      'cache-aware-lora',
                      'Multi-LoRA serving',
                      'Routes to the pod that has both the right LoRA adapter and relevant prefix cache',
                      'Only applicable when serving multiple LoRA adapters',
                    ],
                  ]}
                />

                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#151515', marginBottom: '14px', marginTop: '32px' }}>
                  Prefix-cache-aware routing
                </h4>
                <p style={{ marginBottom: '20px' }}>
                  This is the default policy and the most impactful for conversational workloads. The router checks the Global Prefix Index to see which pods already have cache entries matching the incoming request's token prefix. When a match is found, the pod can skip the expensive prefill computation for the cached portion and begin processing only the new tokens.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  In practice, this means that a chatbot serving many users with the same system prompt can reuse the system prompt's KV cache across all requests. For multi-turn conversations, the pod that handled previous turns already has the full conversation history cached. In benchmarks, this policy achieves approximately 3x throughput improvement and 2x time-to-first-token reduction compared to round-robin routing.
                </p>

                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#151515', marginBottom: '14px', marginTop: '32px' }}>
                  Load-aware routing
                </h4>
                <p style={{ marginBottom: '20px' }}>
                  For workloads where cache reuse is less important (such as batch processing of unique prompts), load-aware routing distributes requests based on pod utilization. It monitors queue depth, active batch size, and available memory across all pods, then routes each request to the pod with the most headroom. This prevents any single pod from becoming a bottleneck and ensures even utilization across the pool.
                </p>

                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#151515', marginBottom: '14px', marginTop: '32px' }}>
                  Predicted-latency routing
                </h4>
                <p style={{ marginBottom: '20px' }}>
                  This policy uses a lightweight{' '}
                  <Term definition="A gradient-boosted decision tree algorithm commonly used for tabular prediction tasks. Here it is trained to predict request latency from features like token count, cache hit ratio, and queue depth.">XGBoost</Term>{' '}
                  model to predict how long each pod would take to serve the incoming request. The prediction considers factors like input token count, expected output length, current queue depth, cache hit ratio, and recent latency history. The request is routed to the pod with the lowest predicted time-to-first-token.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  In benchmarks, predicted-latency routing reduces both TTFT and ITL by approximately 40% compared to round-robin. It also supports per-request{' '}
                  <Term definition="Service Level Objective. A measurable target for system performance, such as 'p99 time-to-first-token under 500ms'.">SLO</Term>{' '}
                  headers, allowing callers to specify their latency target and letting the router factor that into its selection.
                </p>

                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#151515', marginBottom: '14px', marginTop: '32px' }}>
                  Cache-aware LoRA routing
                </h4>
                <p style={{ marginBottom: '20px' }}>
                  When serving multiple fine-tuned versions of the same base model using{' '}
                  <Term definition="Low-Rank Adaptation. A lightweight fine-tuning method that trains a small set of additional parameters (adapters) instead of modifying the full model weights. Multiple LoRA adapters can share a single base model.">LoRA</Term>{' '}
                  adapters, this policy adds adapter awareness to the routing decision. It routes requests to pods that already have the required adapter loaded in memory, avoiding the overhead of swapping adapters. It also considers prefix cache state, so the selected pod ideally has both the right adapter and relevant cached data.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  This is especially valuable in multi-tenant deployments where each tenant has a custom fine-tuned adapter. Without LoRA-aware routing, pods would frequently swap adapters in and out, adding latency and wasting GPU memory.
                </p>
              </Section>
            </div>

            {/* ─── SECTION 6: KV Cache Architecture ─── */}
            <div ref={registerRef('kv-cache')}>
              <Section title="KV cache architecture" id="kv-cache">
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#151515', marginBottom: '14px', marginTop: '8px' }}>
                  What the KV cache stores
                </h4>
                <p style={{ marginBottom: '20px' }}>
                  During the attention computation in each transformer layer, the model produces a <strong>key</strong> vector and a <strong>value</strong> vector for every token. These vectors encode the model's internal representation of each token in context. Once computed, these key-value pairs can be stored and reused: if a future request starts with the same sequence of tokens, the stored KV pairs can be loaded from cache instead of being recomputed from scratch.
                </p>

                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#151515', marginBottom: '14px', marginTop: '32px' }}>
                  Why it matters
                </h4>
                <p style={{ marginBottom: '20px' }}>
                  Without caching, every request must run a full prefill over the entire input, including the system prompt, conversation history, and the new message. For a chatbot with a 2,000-token system prompt and a 10-turn conversation, that could mean re-processing 8,000+ tokens of context on every single message. With caching, only the new tokens need to go through prefill. Everything that was processed in previous turns can be loaded from the cache in a fraction of the time.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  The savings compound with scale. A deployment serving 1,000 concurrent users with the same system prompt can compute that prompt's KV cache once and reuse it across all 1,000 users. Without caching, that same prompt would be computed 1,000 times.
                </p>

                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#151515', marginBottom: '14px', marginTop: '32px' }}>
                  Three-tier hierarchy
                </h4>
                <p style={{ marginBottom: '20px' }}>
                  llm&#x2011;d organizes the KV cache into three tiers, each trading off access speed for capacity:
                </p>

                <InteractiveFlow
                  steps={[
                    {
                      title: 'GPU HBM (Tier 1)',
                      detail:
                        'The active KV cache lives here during inference. Fastest access (3+ TB/s bandwidth) but limited by GPU memory (80 to 141 GB per GPU). This is where hot, actively-used cache entries reside. Entries are promoted here when a request needs them and evicted when memory pressure rises.',
                    },
                    {
                      title: 'CPU DRAM (Tier 2)',
                      detail:
                        'Evicted cache entries move here. Still fast enough for reloading (hundreds of GB/s). Can hold much more data than GPU memory, typically 512 GB to 2 TB per node. Warm prefixes that have been evicted from GPU memory but may be needed again soon are stored here. Restoring from DRAM is much faster than rerunning prefill from scratch.',
                    },
                    {
                      title: 'Disk/NVMe (Tier 3)',
                      detail:
                        'Cold cache entries stored on fast SSDs. Slowest tier but practically unlimited capacity. Used for long-running sessions that have been idle, large conversation histories, and infrequently-accessed prefixes. Even though disk is the slowest tier, loading from NVMe is still significantly faster than recomputing the KV cache through a full prefill pass.',
                    },
                  ]}
                />

                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#151515', marginBottom: '14px', marginTop: '32px' }}>
                  The Global Prefix Index
                </h4>
                <p style={{ marginBottom: '20px' }}>
                  The Global Prefix Index is a central service that tracks which token prefixes are cached on which pods and in which tier. When the router needs to make a routing decision, it queries this index to find out which pods already have relevant data cached. This is the mechanism that enables prefix-cache-aware routing.
                </p>

                <KeyConcept term="Prefix matching">
                  The index compares the incoming request's token sequence against stored prefixes. It finds the longest matching prefix, which represents the maximum amount of computation that can be skipped. For example, if a request starts with a 500-token system prompt followed by a 200-token user message, and a pod has the system prompt cached, the router knows that pod can skip prefilling those 500 tokens and only needs to process the 200 new tokens.
                </KeyConcept>

                <p
                  style={{
                    backgroundColor: '#f3e8f3',
                    border: '2px solid #9b4d9b',
                    borderRadius: '4px',
                    padding: '20px 24px',
                    margin: '24px 0',
                    fontFamily: 'var(--font-body)',
                    fontSize: '18px',
                    lineHeight: '32px',
                    color: '#151515',
                    fontWeight: 600,
                  }}
                >
                  In benchmarks, llm&#x2011;d's KV cache-aware routing achieved 13.9x throughput improvement over round-robin at 250 concurrent users.
                </p>

                <Expand label="How does cache eviction work?">
                  <p style={{ marginBottom: '16px' }}>
                    When a tier fills up, the system evicts the least recently used (LRU) entries to make room for new ones. Rather than discarding evicted entries entirely, they are demoted to the next tier down. An entry evicted from GPU HBM moves to CPU DRAM. An entry evicted from DRAM moves to disk.
                  </p>
                  <p style={{ marginBottom: '16px' }}>
                    Promotion works in the other direction. When a request needs a cache entry that resides in a lower tier, the entry is loaded into the active tier (GPU HBM) and marked as recently used. This keeps frequently-accessed entries in the fastest storage.
                  </p>
                  <p>
                    The eviction policy is configurable. LRU is the default, but operators can adjust parameters like the eviction threshold (how full a tier must be before eviction starts) and the promotion priority (whether to prioritize promoting entries from DRAM vs. disk). The Global Prefix Index is updated in real time as entries move between tiers, so the router always has an accurate view of cache state.
                  </p>
                </Expand>
              </Section>
            </div>

            {/* ─── SECTION 7: InferencePool and Kubernetes Integration ─── */}
            <div ref={registerRef('kubernetes')}>
              <Section title="InferencePool and Kubernetes integration" id="kubernetes">
                <p style={{ marginBottom: '20px' }}>
                  llm&#x2011;d is built to run on Kubernetes from the ground up. Rather than treating Kubernetes as an afterthought, it uses Kubernetes-native primitives to define, discover, and manage inference workloads. The central concept is the <strong>InferencePool</strong>, a Custom Resource Definition (CRD) that tells Kubernetes about the inference service.
                </p>

                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#151515', marginBottom: '14px', marginTop: '32px' }}>
                  What is an InferencePool?
                </h4>
                <p style={{ marginBottom: '20px' }}>
                  An InferencePool is a custom Kubernetes resource that defines a group of model server pods serving the same model. It specifies a label selector that identifies which pods belong to the pool, the target port for inference requests, and configuration for the router (EPP) that manages the pool.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  When you create an InferencePool resource, the llm&#x2011;d controller detects it and sets up the routing infrastructure automatically. The EPP begins watching for pods that match the selector, building its internal registry of available backends.
                </p>

                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#151515', marginBottom: '14px', marginTop: '32px' }}>
                  Pod discovery
                </h4>
                <p style={{ marginBottom: '20px' }}>
                  The InferencePool uses a standard Kubernetes label selector (like <code style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', backgroundColor: '#F0F0F0', padding: '2px 6px', borderRadius: '3px' }}>llm-d.ai/guide: optimized-baseline</code>) to match model server pods. Any pod with that label is automatically included in the pool. When pods are added, removed, or become unhealthy, the EPP detects the change through Kubernetes watch events and updates its routing table accordingly.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  This means scaling is straightforward. If you increase the replica count of your model server StatefulSet, the new pods automatically appear in the pool as soon as they pass health checks. If a pod crashes, it is automatically removed from the routing table. No manual registration is required.
                </p>

                <MonoDiagram
                  lines={[
                    'InferencePool (optimized-baseline)',
                    '  |',
                    '  |-- selector: llm-d.ai/guide=optimized-baseline',
                    '  |-- targetPorts: [8000]',
                    '  |',
                    '  +-- Pod: vllm-decode-abc123',
                    '  |   labels: {llm-d.ai/guide: optimized-baseline}',
                    '  |   ports: [8000]',
                    '  |',
                    '  +-- Pod: vllm-decode-def456',
                    '  |   labels: {llm-d.ai/guide: optimized-baseline}',
                    '  |   ports: [8000]',
                    '  |',
                    '  +-- EPP Deployment (router)',
                    '      watches InferencePool',
                    '      scores and picks pods',
                  ]}
                />

                <KeyConcept term="Well-lit paths">
                  llm&#x2011;d provides 9 pre-tested deployment recipes called "well-lit paths." Each recipe is a validated combination of model, hardware, routing policy, and scaling configuration that has been tested end-to-end. These recipes cover common scenarios: single-model serving on H100, disaggregated serving on B200, multi-LoRA serving, and more. They serve as starting points that you can customize for your specific needs, giving you confidence that the baseline configuration works correctly before you begin tuning.
                </KeyConcept>

                <Expand label="What about multi-model serving?">
                  <p style={{ marginBottom: '16px' }}>
                    Multiple InferencePools can coexist in the same Kubernetes cluster, each serving a different model. For example, you might have one pool for a large 70B model on H100 GPUs and another pool for a smaller 7B model on L40 GPUs. Each pool has its own EPP, its own routing configuration, and its own set of backend pods.
                  </p>
                  <p style={{ marginBottom: '16px' }}>
                    The gateway layer routes incoming requests to the correct pool based on the model name in the request. This is similar to virtual hosting in a web server: the same gateway handles all traffic, but each model has its own backend pool.
                  </p>
                  <p>
                    For LoRA-based multi-tenancy, a single InferencePool can serve multiple adapters on the same base model. The cache-aware LoRA routing policy ensures that requests are directed to pods with the correct adapter loaded, minimizing adapter swap overhead. This is more resource-efficient than running separate pools for each adapter, because the base model weights are shared across all adapters.
                  </p>
                </Expand>
              </Section>
            </div>

            {/* ─── SECTION 8: Autoscaling and Production ─── */}
            <div ref={registerRef('production')}>
              <Section title="Autoscaling and production" id="production">
                <p style={{ marginBottom: '20px' }}>
                  Running LLM inference in production requires more than just deploying pods. Traffic patterns change throughout the day. Some models are busy during business hours and idle at night. Latency requirements vary by use case. llm&#x2011;d's autoscaler is designed specifically for inference workloads, using signals that generic Kubernetes autoscaling cannot access.
                </p>

                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#151515', marginBottom: '14px', marginTop: '32px' }}>
                  SLO-aware scaling
                </h4>
                <p style={{ marginBottom: '20px' }}>
                  Traditional Kubernetes autoscaling (the Horizontal Pod Autoscaler, or HPA) scales based on CPU and memory utilization. For inference workloads, these metrics are poor proxies for user experience. A GPU pod can be at 80% utilization and still meet latency targets, or it can be at 50% utilization and miss them, depending on the type of work it is doing.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  llm&#x2011;d's autoscaler monitors inference-specific metrics: time-to-first-token, inter-token latency, request queue depth, and KV cache utilization. You configure SLO targets (for example, "p99 TTFT under 500ms"), and the autoscaler adjusts replica counts to meet those targets. When latency exceeds the threshold, it scales up the bottleneck pool. When latency is well under target, it scales down to reduce cost.
                </p>

                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#151515', marginBottom: '14px', marginTop: '32px' }}>
                  Workload-variant scaling
                </h4>
                <p style={{ marginBottom: '20px' }}>
                  The autoscaler understands the difference between prefill-heavy and decode-heavy traffic. A burst of new conversations is prefill-heavy: many prompts need initial processing. A period of long responses is decode-heavy: fewer new requests, but existing requests generate many tokens. The autoscaler adjusts each pool independently based on which phase is under pressure.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  For clusters serving multiple models, the autoscaler can optimize across model pools to minimize total cost while meeting per-model SLOs. If one model is idle while another is under pressure, GPU resources can be reallocated.
                </p>

                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#151515', marginBottom: '14px', marginTop: '32px' }}>
                  Scale-to-zero
                </h4>
                <p style={{ marginBottom: '20px' }}>
                  Models with intermittent traffic can scale to zero replicas when idle, freeing GPU resources entirely. When the next request arrives, the autoscaler provisions workers, loads the model weights, and serves the request. The{' '}
                  <Term definition="The delay experienced when a service scales from zero replicas to one. The system must allocate a GPU, load model weights into memory, and warm up before serving the first request.">cold start</Term>{' '}
                  time depends on model size and storage backend, but llm&#x2011;d optimizes this by pre-staging model weights on local storage and using fast weight-loading techniques.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  Scale-to-zero is particularly valuable for development and staging environments, infrequently-used LoRA adapters, and models that serve specific time zones or business hours.
                </p>

                <ComparisonTable
                  headers={['Signal', 'llm-d Autoscaler', 'Generic Kubernetes HPA']}
                  rows={[
                    [
                      'Scaling metric',
                      'TTFT, ITL, queue depth, KV cache utilization',
                      'CPU %, memory %',
                    ],
                    [
                      'Model awareness',
                      'Understands prefill vs decode load',
                      'No model awareness',
                    ],
                    [
                      'Scale-to-zero',
                      'Supported with cold-start optimization',
                      'Requires additional tooling',
                    ],
                    [
                      'Multi-signal',
                      'Combines latency, throughput, and cache metrics',
                      'Single metric or simple formula',
                    ],
                  ]}
                />

                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#151515', marginBottom: '14px', marginTop: '32px' }}>
                  Full production topology
                </h4>
                <p style={{ marginBottom: '20px' }}>
                  Here is how all the pieces fit together in a production deployment:
                </p>

                <MonoDiagram
                  lines={[
                    'Production Topology',
                    '',
                    '┌──────────────────────────────────────────────────────────┐',
                    '│  Gateway (Envoy / AgentGateway)                          │',
                    '│  TLS termination, rate limiting, load balancing          │',
                    '└──────────────────────┬───────────────────────────────────┘',
                    '                       │',
                    '┌──────────────────────▼───────────────────────────────────┐',
                    '│  EPP (Endpoint Picker / llm-d Router)                    │',
                    '│  Prefix-cache-aware scoring, pod selection               │',
                    '│  Watches InferencePool for available backends            │',
                    '└──────────┬─────────────────────┬─────────────────────────┘',
                    '           │                     │',
                    '┌──────────▼──────────┐  ┌──────▼──────────────┐',
                    '│  Prefill Workers    │  │  Decode Workers      │',
                    '│  High-FLOPS GPUs    │  │  High-bandwidth GPUs │',
                    '│  Batch processing   │  │  Token streaming     │',
                    '└──────────┬──────────┘  └──────┬───────────────┘',
                    '           │                     │',
                    '┌──────────▼─────────────────────▼─────────────────────────┐',
                    '│  KV Cache Hierarchy                                       │',
                    '│  GPU HBM --> CPU DRAM --> Disk/NVMe                       │',
                    '│  Global Prefix Index tracks cache locations                │',
                    '└──────────────────────────────────────────────────────────┘',
                    '           │',
                    '┌──────────▼───────────────────────────────────────────────┐',
                    '│  Autoscaler                                               │',
                    '│  SLO-aware, workload-variant, scale-to-zero               │',
                    '│  Monitors TTFT, ITL, queue depth, cache utilization        │',
                    '└──────────────────────────────────────────────────────────┘',
                  ]}
                />

                <p style={{ marginBottom: '20px' }}>
                  llm&#x2011;d brings together intelligent routing, disaggregated inference, hierarchical caching, and SLO-aware autoscaling into a single Kubernetes-native stack. Each piece is optional and composable. You can start with just the router and a single model server, then add disaggregation, caching tiers, and autoscaling as your workload grows.
                </p>
              </Section>
            </div>

            {/* ─── CTA Section ─── */}
            <div
              style={{
                backgroundColor: '#f3e8f3',
                border: '2px solid #9b4d9b',
                borderRadius: '8px',
                padding: '32px',
                textAlign: 'center',
                marginTop: '48px',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#151515',
                  marginBottom: '12px',
                }}
              >
                Ready to try it?
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '18px',
                  color: '#4D4D4D',
                  marginBottom: '20px',
                }}
              >
                Deploy llm&#x2011;d from scratch in 5 minutes with our step-by-step guide.
              </p>
              <Link
                to="/rhai-guide"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#9b4d9b',
                  color: '#fff',
                  padding: '12px 32px',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                  fontSize: '16px',
                  textDecoration: 'none',
                }}
              >
                Get started
              </Link>
            </div>

          </div>
        </div>
      </div>
    </PageTransition>
  )
}
