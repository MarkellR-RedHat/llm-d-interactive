import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import PageTransition from '../components/shared/PageTransition'

interface Notebook {
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  time: string
}

interface Category {
  heading: string
  notebooks: Notebook[]
}

const categories: Category[] = [
  {
    heading: 'Getting Started',
    notebooks: [
      {
        title: 'Your First llm‑d Deployment',
        description:
          'Follow the Optimized Baseline well-lit path to deploy Qwen3-32B with prefix-cache and load-aware routing on 16 GPUs.',
        difficulty: 'Beginner',
        time: '45 min',
      },
      {
        title: 'Sending Your First Requests',
        description:
          'Use the OpenAI-compatible API to send chat completions, explore response formats, and monitor basic metrics.',
        difficulty: 'Beginner',
        time: '20 min',
      },
      {
        title: 'Understanding the Router Dashboard',
        description:
          'Set up Grafana with the llm‑d dashboard recipes, monitor queue depth, cache hit rates, and per-replica metrics in real time.',
        difficulty: 'Beginner',
        time: '30 min',
      },
    ],
  },
  {
    heading: 'Well-Lit Paths: Intelligent Routing',
    notebooks: [
      {
        title: 'Optimized Baseline: Prefix-Cache and Load-Aware Routing',
        description:
          'Deploy the recommended baseline configuration with prefix-cache-scorer and load-aware scoring. Compare throughput and TTFT against raw round-robin.',
        difficulty: 'Intermediate',
        time: '45 min',
      },
      {
        title: 'Precise Prefix Cache Routing',
        description:
          'Enable event-driven KV-cache indexing via ZMQ for exact block-level cache scoring instead of heuristic estimation. Measure the improvement on multi-turn workloads.',
        difficulty: 'Intermediate',
        time: '60 min',
      },
      {
        title: 'Predicted Latency-Based Routing',
        description:
          'Train the XGBoost latency predictor on live traffic and route requests to the replica predicted to serve them fastest. Compare against heuristic routing on mixed workloads.',
        difficulty: 'Advanced',
        time: '60 min',
      },
    ],
  },
  {
    heading: 'Well-Lit Paths: Serving at Scale',
    notebooks: [
      {
        title: 'Prefill/Decode Disaggregation',
        description:
          'Deploy gpt-oss-120b with 8 TP=1 prefill and 2 TP=4 decode workers. Measure throughput per GPU improvement and ITL reduction.',
        difficulty: 'Advanced',
        time: '75 min',
      },
      {
        title: 'Tiered Prefix Cache: CPU and Disk Offloading',
        description:
          'Configure hierarchical KV cache offloading (GPU to CPU to disk) and measure effective cache capacity expansion on multi-turn workloads.',
        difficulty: 'Intermediate',
        time: '60 min',
      },
      {
        title: 'Wide Expert-Parallelism for DeepSeek-R1',
        description:
          'Deploy DeepSeek-R1 across multiple nodes using LeaderWorkerSet with combined DP/EP configuration.',
        difficulty: 'Advanced',
        time: '90 min',
      },
    ],
  },
  {
    heading: 'Well-Lit Paths: Operations',
    notebooks: [
      {
        title: 'Flow Control and Multi-Tenant Fairness',
        description:
          'Configure priority bands, round-robin fairness, and late-binding scheduling. Test with multiple simulated tenants competing for GPU capacity.',
        difficulty: 'Intermediate',
        time: '45 min',
      },
      {
        title: 'SLO-Aware Workload Autoscaling',
        description:
          'Set up HPA with EPP metrics and watch replicas scale based on queue depth. Then configure the Workload Variant Autoscaler for multi-model cost optimization.',
        difficulty: 'Intermediate',
        time: '60 min',
      },
      {
        title: 'LoRA Adapter Rollouts',
        description:
          'Perform an incremental rollout of a new LoRA adapter using traffic splitting and gradual deployment. Monitor for regressions during the rollout.',
        difficulty: 'Advanced',
        time: '45 min',
      },
    ],
  },
  {
    heading: 'Experimental',
    notebooks: [
      {
        title: 'Asynchronous Processing with Redis',
        description:
          'Set up the Async Processor to pull inference requests from a Redis queue with flow-control gating. Ideal for batch workloads.',
        difficulty: 'Advanced',
        time: '60 min',
      },
      {
        title: 'Batch Inference via the Batch Gateway',
        description:
          'Submit, track, and manage batch jobs via the OpenAI-compatible /v1/batches API. Co-locate batch and interactive workloads on shared infrastructure.',
        difficulty: 'Advanced',
        time: '45 min',
      },
    ],
  },
]

const difficultyColors: Record<string, { bg: string; text: string }> = {
  Beginner: { bg: '#E8F5E9', text: '#2E7D32' },
  Intermediate: { bg: '#FFF8E1', text: '#F57F17' },
  Advanced: { bg: '#FFEBEE', text: '#C62828' },
}

function NotebookCard({
  notebook,
  index,
  isInView,
}: {
  notebook: Notebook
  index: number
  isInView: boolean
}) {
  const colors = difficultyColors[notebook.difficulty]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      style={{
        flex: '0 0 50%',
        maxWidth: '50%',
        padding: '12px',
      }}
      className="notebook-card-col"
    >
      <a
        href="#"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '32px',
          backgroundColor: '#F0F0F0',
          textDecoration: 'none',
          height: '100%',
          position: 'relative',
          top: '0',
          transition: 'ease 0.4s all',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.top = '-4px'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
          e.currentTarget.style.backgroundColor = '#EAEAEA'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.top = '0'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.backgroundColor = '#F0F0F0'
        }}
      >
        <div>
          <h4
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '20px',
              lineHeight: '1.3',
              color: '#151515',
              marginBottom: '12px',
            }}
          >
            {notebook.title}
          </h4>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              lineHeight: '24px',
              color: '#4D4D4D',
              margin: 0,
            }}
          >
            {notebook.description}
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '20px',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              fontSize: '12px',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              letterSpacing: '0.02em',
              backgroundColor: colors.bg,
              color: colors.text,
              borderRadius: '2px',
            }}
          >
            {notebook.difficulty}
          </span>
          <span
            style={{
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
              color: '#6A6E73',
            }}
          >
            {notebook.time}
          </span>
        </div>
      </a>
    </motion.div>
  )
}

function CategorySection({ category }: { category: Category }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div ref={ref} style={{ marginBottom: '56px' }}>
      <motion.h3
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.35 }}
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '28px',
          lineHeight: '1.2',
          color: '#151515',
          marginBottom: '20px',
        }}
      >
        {category.heading}
      </motion.h3>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          margin: '0 -12px',
        }}
      >
        {category.notebooks.map((nb, i) => (
          <NotebookCard
            key={nb.title}
            notebook={nb}
            index={i}
            isInView={isInView}
          />
        ))}
      </div>
    </div>
  )
}

export default function Notebooks() {
  return (
    <PageTransition>
      <section
        style={{
          paddingTop: '140px',
          paddingBottom: '100px',
          backgroundColor: '#fff',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            maxWidth: '1244px',
            margin: '0 auto',
            padding: '0 30px',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '48px', maxWidth: '720px' }}>
            <span
              style={{
                display: 'inline-block',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                color: '#9b4d9b',
                marginBottom: '16px',
              }}
            >
              Hands-on Tutorials
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 5vw, 56px)',
                fontWeight: 300,
                lineHeight: '110%',
                letterSpacing: '-0.02em',
                color: '#151515',
                marginBottom: '24px',
              }}
            >
              Jupyter Notebooks
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '18px',
                lineHeight: '30px',
                color: '#4D4D4D',
              }}
            >
              Explore llm&#x2011;d's well-lit paths through hands-on notebooks. Each
              notebook walks you through a tested, benchmarked deployment
              recipe{' '}
              <span style={{ whiteSpace: 'nowrap' }}>step by step</span>,
              from intelligent routing to disaggregated serving and
              production operations.
            </p>
          </div>

          {/* Intro paragraph */}
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              lineHeight: '26px',
              color: '#212121',
              maxWidth: '740px',
              marginBottom: '56px',
            }}
          >
            Each notebook is designed to be run locally or in any Jupyter
            environment. They include all the code, configuration, and
            commentary you need to go from zero to a working result. Start
            with Getting Started if this is your first time, then follow
            the well-lit paths for production-ready deployments.
          </p>

          {/* Category sections */}
          {categories.map((cat) => (
            <CategorySection key={cat.heading} category={cat} />
          ))}
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .notebook-card-col {
            flex: 0 0 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </PageTransition>
  )
}
