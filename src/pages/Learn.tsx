import { useState, useRef, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/shared/PageTransition'

/* ─── Helper Components ─── */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: '56px' }}>
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

function Diagram({ steps }: { steps: string[] }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '32px 0',
      }}
    >
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'stretch' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginRight: '20px',
              minWidth: '24px',
            }}
          >
            <div
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#EE0000',
                flexShrink: 0,
                marginTop: '6px',
              }}
            />
            {i < steps.length - 1 && (
              <div
                style={{
                  width: '2px',
                  flexGrow: 1,
                  backgroundColor: '#D2D2D2',
                  minHeight: '32px',
                }}
              />
            )}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '17px',
              lineHeight: '28px',
              color: '#212121',
              paddingBottom: i < steps.length - 1 ? '24px' : '0',
            }}
          >
            {step}
          </div>
        </div>
      ))}
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

/* ─── Tab Content ─── */

function BasicsTab() {
  return (
    <div>
      <Section title="What does llm&#x2011;d do?">
        <p style={{ marginBottom: '20px' }}>
          Think of a busy restaurant. You could have one chef doing everything:
          taking orders, prepping ingredients, cooking every dish, plating, and
          cleaning up. That works for a small cafe, but it collapses under pressure.
        </p>
        <p style={{ marginBottom: '20px' }}>
          Now imagine a professional kitchen. A host routes incoming orders to the
          right station. One cook specializes in prep work. Another handles the grill.
          They share a common pantry so ingredients prepped once can be reused.
          Each station scales independently based on demand.
        </p>
        <p style={{ marginBottom: '20px' }}>
          That is what llm&#x2011;d does for large language model inference. Instead
          of running everything on a single GPU (or a single process), it splits
          the work into specialized pieces that can each scale on their own.
          A router directs requests. Prefill workers handle the compute-heavy initial
          processing. Decode workers generate tokens one at a time. And a shared
          KV cache acts as the pantry, storing previous work so it can be reused
          across requests.
        </p>
      </Section>

      <Section title="The key ideas">
        <p style={{ marginBottom: '16px' }}>
          Here is the basic flow of a request through llm&#x2011;d:
        </p>
        <Diagram
          steps={[
            'A request comes in from a user or application.',
            'The router decides which worker should handle it, based on cache state, load, and predicted latency.',
            'A prefill worker processes the input prompt, converting tokens into internal representations.',
            'The KV cache stores the computed state so future requests with the same prefix can skip this work.',
            'A decode worker generates the response tokens one at a time, streaming them back to the caller.',
          ]}
        />
      </Section>

      <Section title="Why does this matter?">
        <p style={{ marginBottom: '20px' }}>
          Large language models are expensive to run. A single high-end GPU can cost
          thousands of dollars per month. When that GPU sits idle waiting for one
          part of the pipeline to finish, or when it re-computes work it has already
          done for a previous request, that is wasted money.
        </p>
        <p style={{ marginBottom: '20px' }}>
          llm&#x2011;d addresses this directly. By disaggregating inference into
          prefill and decode stages, each can be placed on hardware matched to its
          workload profile. By sharing a KV cache across workers, repeated prompts
          (system prompts, common prefixes, multi-turn conversations) avoid redundant
          computation. By using intelligent routing, requests land on the worker
          best positioned to serve them quickly.
        </p>
        <p>
          The result: higher throughput, lower latency, and better GPU utilization,
          all without changing the model or the API your application already uses.
        </p>
      </Section>
    </div>
  )
}

function BeginnerTab() {
  return (
    <div>
      <Section title="What is LLM serving?">
        <p style={{ marginBottom: '20px' }}>
          LLM serving is the infrastructure that sits between a trained model and
          the applications that use it. It handles loading the model onto GPUs,
          accepting API requests, managing batching, and streaming results back.
        </p>
        <p style={{ marginBottom: '20px' }}>
          Most serving frameworks (vLLM, TGI, Triton) handle single-node or
          basic multi-node setups well. llm&#x2011;d adds distributed orchestration
          on top of vLLM, turning a cluster of GPU nodes into a coordinated serving
          system with intelligent routing, shared caching, and independent scaling
          of each component.
        </p>
      </Section>

      <Section title="Core components">
        <KeyConcept term="Router">
          The entry point for all requests. It implements multiple routing policies:
          prefix-cache-aware routing, load-aware routing, and predicted-latency
          routing. Built from two subcomponents: the Endpoint Picker (which selects
          the best worker) and the Proxy (which forwards the request).
        </KeyConcept>
        <KeyConcept term="Prefill Workers">
          Handle the compute-intensive first phase of inference. They process the
          entire input prompt at once, computing attention across all input tokens.
          This is a compute-bound workload that benefits from high FLOPS hardware.
        </KeyConcept>
        <KeyConcept term="Decode Workers">
          Handle the memory-bandwidth-intensive second phase. They generate output
          tokens one at a time, reading from the KV cache at each step. This workload
          is bound by memory bandwidth rather than raw compute.
        </KeyConcept>
        <KeyConcept term="KV Cache">
          A hierarchical storage system spanning GPU HBM, CPU DRAM, and disk. A global
          index tracks which prefixes exist across the entire cluster, enabling
          cache-aware routing decisions. Previously computed KV states can be reused
          by any worker that needs them.
        </KeyConcept>
        <KeyConcept term="Autoscaler">
          Scales prefill and decode worker pools independently based on SLO targets
          and inference-specific signals. Supports scale-to-zero for cost optimization
          when models are idle.
        </KeyConcept>
      </Section>

      <Section title="How a request flows">
        <Diagram
          steps={[
            'Client sends a prompt via the OpenAI-compatible API.',
            'Router checks the global KV cache index for matching prefixes.',
            'Endpoint Picker selects the best worker based on the active routing policy (cache hit, current load, predicted latency).',
            'Prefill worker processes all input tokens, computing attention representations.',
            'Computed KV state is stored in the global cache and indexed for future reuse.',
            'Decode worker generates output tokens one at a time, reading from the KV cache at each step.',
            'Response streams back through the router to the client via SSE.',
          ]}
        />
      </Section>

      <Section title="vLLM alone vs. vLLM + llm&#x2011;d">
        <ComparisonTable
          headers={['Capability', 'vLLM Alone', 'vLLM + llm‑d']}
          rows={[
            ['Routing', 'Round-robin or random', 'Prefix-cache-aware, load-aware, predicted-latency'],
            ['KV Cache', 'Local to each instance', 'Hierarchical (GPU/CPU/disk) with global index'],
            ['Scaling', 'Manual replica count', 'SLO-aware autoscaling, scale-to-zero'],
            ['Prefill / Decode split', 'Combined on same GPU', 'Disaggregated, independently scalable'],
            ['Multi-tenant', 'Separate deployments', 'Shared cluster with LoRA-aware routing'],
            ['Deployment', 'Single process or basic TP', 'Kubernetes-native with Helm charts and operators'],
          ]}
        />
      </Section>
    </div>
  )
}

function IntermediateTab() {
  return (
    <div>
      <Section title="Disaggregated inference in depth">
        <p style={{ marginBottom: '20px' }}>
          Prefill and decode have fundamentally different hardware requirements.
          Prefill processes the entire input sequence at once, performing dense
          matrix multiplications across all tokens. This is compute-bound: more
          FLOPS means faster prefill. Decode generates one token at a time, reading
          the full KV cache at each step. This is memory-bandwidth-bound: faster
          memory access means faster decode.
        </p>
        <p style={{ marginBottom: '20px' }}>
          When both phases share the same GPU, they contend for resources. A long
          prefill blocks decode, increasing inter-token latency for in-flight
          requests. A decode-heavy load leaves compute underutilized during prefill.
        </p>
        <p style={{ marginBottom: '20px' }}>
          llm&#x2011;d deploys prefill and decode as separate Kubernetes workloads
          (StatefulSets), each with its own scaling policy and hardware allocation.
          This eliminates contention and lets operators right-size each pool.
        </p>
        <KeyConcept term="Validated topology">
          16 prefill + 16 decode B200 GPUs sustaining over 50,000 output tokens
          per second. This configuration demonstrates near-linear scaling with
          disaggregated pools.
        </KeyConcept>
      </Section>

      <Section title="Routing policies explained">
        <KeyConcept term="Prefix-cache-aware routing">
          Directs requests to workers that already have matching KV cache entries
          for the prompt prefix. By reusing cached state instead of re-computing it,
          this policy achieves approximately 3x throughput improvement and 2x
          time-to-first-token reduction compared to round-robin routing.
        </KeyConcept>
        <KeyConcept term="Load-aware routing">
          Monitors queue depth and utilization across workers, steering new requests
          to the least loaded instance. This prevents hot spots and smooths tail
          latencies across the cluster.
        </KeyConcept>
        <KeyConcept term="Predicted-latency routing">
          Uses an XGBoost model trained on request characteristics (token count,
          cache hit ratio, current queue state) to predict per-worker latency for
          each incoming request. Routes to the worker with the lowest predicted
          completion time. In benchmarks, this achieves approximately 40% reduction
          in both time-to-first-token and inter-token latency. Supports SLO headers
          for per-request latency targets.
        </KeyConcept>
        <KeyConcept term="Cache-aware LoRA routing">
          For multi-tenant deployments using LoRA adapters, this policy routes
          requests to workers that already have the required adapter loaded,
          avoiding adapter swap overhead.
        </KeyConcept>
      </Section>

      <Section title="KV cache hierarchy">
        <p style={{ marginBottom: '20px' }}>
          The KV cache in llm&#x2011;d is organized into three tiers, each trading
          off speed for capacity:
        </p>
        <KeyConcept term="Tier 1: GPU HBM">
          Fastest access (terabytes/sec bandwidth), smallest capacity (tens of GB
          per device). Hot prefixes and in-flight request state live here.
        </KeyConcept>
        <KeyConcept term="Tier 2: CPU DRAM">
          High capacity (hundreds of GB per node), moderate bandwidth. Warm prefixes
          that have been evicted from GPU memory are held here, avoiding a full
          recompute on cache miss.
        </KeyConcept>
        <KeyConcept term="Tier 3: Disk / NVMe">
          Very high capacity (terabytes), lowest bandwidth. Cold prefixes and
          long-lived conversational state are persisted here for retrieval when
          sessions resume.
        </KeyConcept>
        <p style={{ marginTop: '20px', marginBottom: '20px' }}>
          A global index tracks which prefixes reside on which tier and which node,
          enabling the router to make cache-aware decisions across the entire cluster.
        </p>
        <KeyConcept term="Benchmark">
          On a 4x H100 cluster with 250 concurrent users, the hierarchical cache
          achieves 13.9x throughput compared to a GPU-only cache baseline,
          because evicted prefixes can be restored from CPU or disk rather than
          recomputed from scratch.
        </KeyConcept>
      </Section>

      <Section title="Supported hardware">
        <ComparisonTable
          headers={['Vendor', 'Accelerators', 'Notes']}
          rows={[
            ['NVIDIA', 'H100, H200, B200', 'Primary development and benchmark platform'],
            ['AMD', 'MI300X', 'Supported via ROCm-compatible vLLM backend'],
            ['Intel', 'XPU, Gaudi', 'Supported for inference workloads'],
            ['Google', 'TPU', 'Supported for Cloud TPU deployments'],
          ]}
        />
      </Section>
    </div>
  )
}

function AdvancedTab() {
  return (
    <div>
      <Section title="Production deployment topology">
        <p style={{ marginBottom: '16px' }}>
          A production llm&#x2011;d deployment on Kubernetes consists of several
          coordinated resources:
        </p>
        <MonoDiagram
          lines={[
            '                  +---------------------+',
            '                  |   Ingress / LB      |',
            '                  +----------+----------+',
            '                             |',
            '                  +----------v----------+',
            '                  |   Router Deployment  |',
            '                  |   (Endpoint Picker   |',
            '                  |    + Proxy, 2+ pods) |',
            '                  +----+------------+----+',
            '                       |            |',
            '            +----------v---+  +-----v-----------+',
            '            |  Prefill     |  |  Decode          |',
            '            |  StatefulSet |  |  StatefulSet     |',
            '            |  (N pods,    |  |  (M pods,        |',
            '            |   compute-   |  |   bandwidth-     |',
            '            |   optimized) |  |   optimized)     |',
            '            +------+-------+  +--------+---------+',
            '                   |                    |',
            '            +------v--------------------v---------+',
            '            |      KV Cache Layer                  |',
            '            |  +--------+ +--------+ +---------+  |',
            '            |  |GPU HBM | |CPU DRAM| |Disk/NVMe|  |',
            '            |  +--------+ +--------+ +---------+  |',
            '            |      Global Prefix Index             |',
            '            +-----------------------+--------------+',
            '                                    |',
            '            +-----------------------v--------------+',
            '            |  Autoscaler                           |',
            '            |  (SLO-aware, per-pool scaling,        |',
            '            |   scale-to-zero capable)              |',
            '            +--------------------------------------+',
            '',
            '  ConfigMaps: model config, routing policy, SLO targets',
            '  Secrets: model registry credentials, TLS certs',
          ]}
        />
        <p>
          The router runs as a standard Deployment (stateless, horizontally scalable).
          Prefill and decode pools run as StatefulSets with persistent volume claims
          for local model caching. The autoscaler watches latency metrics from the
          router and adjusts replica counts per pool.
        </p>
      </Section>

      <Section title="Autoscaling strategies">
        <KeyConcept term="SLO-aware scaling">
          The autoscaler monitors time-to-first-token and inter-token latency against
          configurable targets. When latency exceeds the SLO threshold, it scales up
          the bottleneck pool (prefill or decode) independently. When latency is well
          under target, it scales down to reduce cost. Scaling decisions use
          inference-specific signals (queue depth, batch utilization, cache hit rate)
          rather than generic CPU/memory metrics.
        </KeyConcept>
        <KeyConcept term="Workload-variant scaling">
          For clusters serving multiple models, the autoscaler can optimize across
          model pools to minimize total cost while meeting per-model SLOs. If one
          model is idle while another is under pressure, resources can be reallocated.
        </KeyConcept>
        <KeyConcept term="Scale-to-zero">
          Models with intermittent traffic can scale to zero replicas when idle.
          On the next request, the autoscaler provisions workers, loads the model,
          and serves the request. Cold start time depends on model size and storage
          backend. This is particularly useful for development, staging, and
          low-traffic LoRA adapters.
        </KeyConcept>
      </Section>

      <Section title="Performance benchmarks">
        <p style={{ marginBottom: '16px' }}>
          Published benchmark results from llm&#x2011;d testing:
        </p>
        <ComparisonTable
          headers={['Configuration', 'Metric', 'Result']}
          rows={[
            ['16x16 B200 (P/D split)', 'Output throughput', '> 50,000 tok/s'],
            ['Prefix-cache-aware routing', 'Throughput vs. round-robin', '~3x improvement'],
            ['Prefix-cache-aware routing', 'TTFT vs. round-robin', '~2x reduction'],
            ['Predicted-latency routing', 'TTFT reduction', '~40% lower'],
            ['Predicted-latency routing', 'ITL reduction', '~40% lower'],
            ['4x H100, hierarchical cache', 'Throughput at 250 users (vs. GPU-only)', '13.9x'],
            ['B200, DeepSeek (MoE)', 'Per-GPU throughput', '~3,100 tok/s/GPU'],
          ]}
        />
      </Section>

      <Section title="Mixture-of-Experts support">
        <p style={{ marginBottom: '20px' }}>
          Large Mixture-of-Experts (MoE) models like the DeepSeek family present
          unique serving challenges. Only a subset of experts activate per token,
          but all expert weights must be resident in memory. This makes the
          memory footprint large relative to the compute actually used per
          forward pass.
        </p>
        <p style={{ marginBottom: '20px' }}>
          llm&#x2011;d supports wide expert-parallelism for MoE architectures,
          distributing expert weights across multiple GPUs so that each device
          holds a manageable subset. When a token activates experts on a remote
          device, the system handles the inter-GPU communication transparently.
        </p>
        <KeyConcept term="DeepSeek on B200">
          Approximately 3,100 output tokens per second per GPU on NVIDIA B200
          hardware using wide expert-parallelism. This enables serving very large
          MoE models at production throughput levels.
        </KeyConcept>
      </Section>

      <Section title="Transport and high availability">
        <KeyConcept term="UCCL transport">
          llm&#x2011;d integrates with UCCL (Unified Collective Communication
          Library) for high-performance inter-node communication during
          tensor-parallel and expert-parallel inference. UCCL optimizes collective
          operations (all-reduce, all-gather) across GPU interconnects, minimizing
          communication overhead in multi-node deployments.
        </KeyConcept>
        <KeyConcept term="Active-active router HA">
          The router supports active-active high availability. Multiple router
          replicas run concurrently behind a load balancer, each maintaining an
          up-to-date view of worker health and cache state. If a router instance
          fails, traffic is seamlessly handled by the remaining replicas with no
          request loss or cache index staleness.
        </KeyConcept>
      </Section>
    </div>
  )
}

/* ─── Tab Configuration ─── */

const tabs = [
  { id: 'basics', label: 'The Basics' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
] as const

type TabId = (typeof tabs)[number]['id']

const tabContent: Record<TabId, () => React.JSX.Element> = {
  basics: BasicsTab,
  beginner: BeginnerTab,
  intermediate: IntermediateTab,
  advanced: AdvancedTab,
}

/* ─── Main Page ─── */

export default function Learn() {
  const [activeTab, setActiveTab] = useState<TabId>('basics')
  const [isSticky, setIsSticky] = useState(false)
  const tabBarRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const ActiveContent = tabContent[activeTab]

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
                backgroundColor: '#EE0000',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '24px',
              }}
            >
              Learning Center
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: 300,
                lineHeight: '110%',
                letterSpacing: '-0.02em',
                color: '#151515',
                marginBottom: '20px',
                maxWidth: '800px',
              }}
            >
              What is <span style={{ whiteSpace: 'nowrap' }}>llm&#x2011;d</span>?
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '20px',
                lineHeight: '32px',
                color: '#4D4D4D',
                maxWidth: '640px',
              }}
            >
              From first principles to production deployment. Learn at your own
              pace, starting from wherever you are.
            </p>
          </div>
        </div>

        {/* Sentinel for IntersectionObserver (placed right above the tab bar) */}
        <div ref={sentinelRef} style={{ height: '1px', margin: 0, padding: 0 }} />

        {/* Sticky Tab Bar */}
        <div
          ref={tabBarRef}
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: '#fff',
            borderBottom: '1px solid #E0E0E0',
            boxShadow: isSticky ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            transition: 'box-shadow 0.3s ease',
          }}
        >
          <div
            style={{
              maxWidth: '1244px',
              margin: '0 auto',
              padding: '0 30px',
              display: 'flex',
              gap: '0',
              overflowX: 'auto',
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '16px 24px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: '15px',
                  color: activeTab === tab.id ? '#EE0000' : '#4D4D4D',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom:
                    activeTab === tab.id
                      ? '3px solid #EE0000'
                      : '3px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s ease, border-color 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div
          style={{
            maxWidth: '1244px',
            margin: '0 auto',
            padding: '48px 30px 80px',
          }}
        >
          <div style={{ maxWidth: '820px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <ActiveContent />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
