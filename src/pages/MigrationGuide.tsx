import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/shared/PageTransition'
import Expand from '../components/shared/Expand'

/* ─── Types ─── */

type Platform = 'vllm' | 'tgi' | 'triton'

interface PlatformOption {
  id: Platform
  label: string
  description: string
}

/* ─── Platform Data ─── */

const platforms: PlatformOption[] = [
  { id: 'vllm', label: 'vLLM', description: 'High-throughput serving engine' },
  { id: 'tgi', label: 'TGI', description: 'HuggingFace Text Generation Inference' },
  { id: 'triton', label: 'Triton', description: 'NVIDIA Triton Inference Server' },
]

const keyDifferences: Record<Platform, { headers: string[]; rows: string[][] }> = {
  vllm: {
    headers: ['Concept', 'vLLM', 'llm‑d'],
    rows: [
      ['Model Loading', 'vLLM loads model directly', 'llm‑d uses vLLM as the model server under the hood'],
      ['Routing', 'Single endpoint, no routing', 'EPP with prefix‑cache, load‑aware, predicted‑latency routing'],
      ['Scaling', 'Manual or basic HPA', 'SLO‑aware autoscaler, workload‑variant, scale‑to‑zero'],
      ['KV Cache', 'GPU memory only', 'Hierarchical: GPU, CPU, disk with global indexing'],
      ['Prefill/Decode', 'Same process', 'Optional disaggregation into separate worker pools'],
      ['Multi‑tenant', 'Not supported', 'Flow control with priority bands and tenant fairness'],
      ['API', 'OpenAI‑compatible', 'Same OpenAI‑compatible API, no client changes needed'],
    ],
  },
  tgi: {
    headers: ['Concept', 'TGI', 'llm‑d'],
    rows: [
      ['Model Loading', 'TGI loads HuggingFace models', 'llm‑d wraps vLLM which loads models from HF or local paths'],
      ['Routing', 'Single endpoint', 'EPP with intelligent routing policies'],
      ['Batching', 'Continuous batching built in', 'vLLM continuous batching + llm‑d cluster‑level optimization'],
      ['Quantization', 'GPTQ, AWQ, EETQ', 'vLLM supports GPTQ, AWQ, FP8, and more'],
      ['Scaling', 'Manual', 'SLO‑aware autoscaler with scale‑to‑zero'],
      ['API', 'HF‑compatible + OpenAI compat', 'OpenAI‑compatible (may need client changes from HF format)'],
    ],
  },
  triton: {
    headers: ['Concept', 'Triton', 'llm‑d'],
    rows: [
      ['Model Loading', 'Triton model repository', 'llm‑d uses vLLM with direct model paths'],
      ['Ensemble', 'Triton ensemble pipelines', 'llm‑d disaggregated prefill/decode via router'],
      ['Backend', 'Multiple backends (TensorRT‑LLM, vLLM, etc.)', 'vLLM or SGLang as model server'],
      ['Routing', 'Triton load balancer', 'EPP with LLM‑aware routing'],
      ['Metrics', 'Triton metrics server', 'EPP exports queue depth, cache hit rate, latency'],
      ['API', 'Triton HTTP/gRPC', 'OpenAI‑compatible REST API'],
    ],
  },
}

const migrationSteps = [
  {
    title: '1. Deploy the llm‑d Router (Envoy proxy + EPP)',
    detail:
      'The router is the entry point for all inference traffic. It consists of an Envoy proxy for traffic management and the Endpoint Picker (EPP) for intelligent request routing. Deploy it using the provided Helm chart or kustomize overlay.',
  },
  {
    title: '2. Configure your InferencePool',
    detail:
      'An InferencePool defines a group of model server pods that serve the same model. Configure the pool with your model name, resource requirements, and replica count. The pool is a Kubernetes custom resource that the router watches for changes.',
  },
  {
    title: '3. Point your vLLM/model server pods to register with the pool',
    detail:
      'Each model server pod needs labels that match the InferencePool selector so the EPP discovers them automatically. If you already run vLLM, add the required labels and annotations to your existing deployment manifests.',
  },
  {
    title: '4. Update your client endpoint to go through the router',
    detail:
      'Change your application configuration to send requests to the router service instead of directly to model server pods. The API format remains OpenAI‑compatible, so no code changes are needed on the client side.',
  },
  {
    title: '5. Configure your routing policy',
    detail:
      'Choose a routing policy that matches your workload. Prefix‑cache‑aware routing works well for workloads with shared system prompts. Load‑aware routing is a good default. Predicted‑latency routing gives the best results but requires a short training period.',
  },
  {
    title: '6. (Optional) Enable disaggregated serving',
    detail:
      'Split your model server pods into separate prefill and decode pools. This eliminates contention between the two phases and lets you scale each independently. Configure this by creating two InferencePool resources with different roles.',
  },
  {
    title: '7. (Optional) Set up autoscaling',
    detail:
      'Deploy the llm‑d autoscaler and configure SLO targets for time‑to‑first‑token and inter‑token latency. The autoscaler monitors these metrics from the router and adjusts replica counts for each pool independently.',
  },
]

/* ─── Comparison Table (matching Learn page style) ─── */

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
                    fontWeight: ci === 0 ? 600 : 400,
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

/* ─── Section Helper ─── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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

/* ─── Main Page ─── */

export default function MigrationGuide() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('vllm')

  const currentDifferences = keyDifferences[selectedPlatform]
  const currentLabel = platforms.find((p) => p.id === selectedPlatform)!.label

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
                backgroundColor: '#9b4d9b',
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
                color: '#151515',
                marginBottom: '20px',
                maxWidth: '800px',
              }}
            >
              Migration Guide
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
              Coming from vLLM, TGI, or Triton? See how concepts map and what
              changes.
            </p>
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
          <div style={{ maxWidth: '900px' }}>
            {/* Platform Selector */}
            <div style={{ marginBottom: '48px' }}>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#4D4D4D',
                  marginBottom: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Select your current platform
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                }}
              >
                {platforms.map((platform) => {
                  const isSelected = selectedPlatform === platform.id
                  return (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedPlatform(platform.id)}
                      style={{
                        padding: '24px',
                        border: isSelected
                          ? '2px solid #9b4d9b'
                          : '2px solid #E0E0E0',
                        backgroundColor: isSelected ? '#f3e8f3' : '#fff',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '22px',
                          fontWeight: 700,
                          color: isSelected ? '#7f317f' : '#151515',
                          marginBottom: '6px',
                        }}
                      >
                        {platform.label}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '14px',
                          color: isSelected ? '#7f317f' : '#6A6E73',
                          lineHeight: '20px',
                        }}
                      >
                        {platform.description}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Animated content sections */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedPlatform}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                {/* Section 1: Key Differences */}
                <Section title={`Key Differences: ${currentLabel} vs. llm‑d`}>
                  <p style={{ marginBottom: '16px' }}>
                    How familiar concepts in {currentLabel} map to their equivalents
                    in llm&#x2011;d.
                  </p>
                  <ComparisonTable
                    headers={currentDifferences.headers}
                    rows={currentDifferences.rows}
                  />
                </Section>

                {/* Section 2: What You Keep */}
                <Section title="What You Keep">
                  <p style={{ marginBottom: '16px' }}>
                    These things do not change when you migrate to llm&#x2011;d:
                  </p>
                  <ul
                    style={{
                      listStyleType: 'disc',
                      paddingLeft: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <li>
                      <strong>Your model weights</strong> (same format, no conversion
                      needed)
                    </li>
                    <li>
                      <strong>Your client code</strong> (if already using
                      OpenAI-compatible format)
                    </li>
                    <li>
                      <strong>Your Kubernetes cluster</strong> (llm&#x2011;d deploys
                      alongside your existing infrastructure)
                    </li>
                    <li>
                      <strong>Your GPU hardware</strong> (NVIDIA, AMD, Intel, and
                      Google TPUs are all supported)
                    </li>
                    <li>
                      <strong>Your monitoring stack</strong> (Prometheus metrics are
                      exported for standard observability tooling)
                    </li>
                  </ul>
                </Section>

                {/* Section 3: What Changes */}
                <Section title="What Changes">
                  <p style={{ marginBottom: '16px' }}>
                    These are the differences you will need to account for:
                  </p>
                  <ul
                    style={{
                      listStyleType: 'disc',
                      paddingLeft: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <li>
                      <strong>Deployment manifests</strong> change to Helm charts or
                      kustomize overlays for llm&#x2011;d components (router, pools,
                      autoscaler)
                    </li>
                    <li>
                      <strong>Routing is no longer your responsibility.</strong> The
                      EPP handles request distribution with LLM-aware policies
                    </li>
                    <li>
                      <strong>KV cache management is automatic.</strong> The
                      hierarchical cache with global indexing replaces manual memory
                      tuning
                    </li>
                    <li>
                      <strong>Scaling is SLO-driven</strong> instead of
                      utilization-driven. You set latency targets; the autoscaler
                      manages replica counts
                    </li>
                    <li>
                      <strong>Traffic flows through the router</strong> instead of
                      directly to model server pods
                    </li>
                  </ul>
                </Section>
              </motion.div>
            </AnimatePresence>

            {/* Section 4: Migration Steps (not animated, same for all platforms) */}
            <Section title="Migration Steps">
              <p style={{ marginBottom: '8px' }}>
                Follow these steps to migrate your serving infrastructure to
                llm&#x2011;d. Each step includes additional detail you can expand.
              </p>
              {migrationSteps.map((step) => (
                <Expand key={step.title} label={step.title}>
                  <p>{step.detail}</p>
                </Expand>
              ))}
            </Section>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
