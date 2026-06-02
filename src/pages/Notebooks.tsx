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
          'Set up a basic llm‑d cluster on minikube and serve a small model.',
        difficulty: 'Beginner',
        time: '30 min',
      },
      {
        title: 'Understanding the Router',
        description:
          'Send requests and observe how the router distributes them across replicas.',
        difficulty: 'Beginner',
        time: '20 min',
      },
      {
        title: 'Exploring the API',
        description:
          'Walk through the OpenAI‑compatible API endpoints and response formats.',
        difficulty: 'Beginner',
        time: '15 min',
      },
    ],
  },
  {
    heading: 'Routing Deep Dive',
    notebooks: [
      {
        title: 'Prefix‑Cache Routing vs Round‑Robin',
        description:
          'Run the same workload under both policies and compare throughput and TTFT.',
        difficulty: 'Intermediate',
        time: '45 min',
      },
      {
        title: 'Load‑Aware Routing Under Burst Traffic',
        description:
          'Simulate bursty traffic patterns and observe how load‑aware routing prevents hotspots.',
        difficulty: 'Intermediate',
        time: '30 min',
      },
      {
        title: 'Predicted Latency Scheduling',
        description:
          'Train the XGBoost latency predictor on live traffic and measure the improvement.',
        difficulty: 'Advanced',
        time: '60 min',
      },
    ],
  },
  {
    heading: 'Infrastructure',
    notebooks: [
      {
        title: 'KV Cache Hierarchy Exploration',
        description:
          'Configure GPU, CPU, and disk tiers and observe cache hit rates under different workloads.',
        difficulty: 'Intermediate',
        time: '45 min',
      },
      {
        title: 'Autoscaling with SLO Targets',
        description:
          'Define latency SLOs and watch the autoscaler add and remove workers.',
        difficulty: 'Intermediate',
        time: '40 min',
      },
    ],
  },
  {
    heading: 'Advanced Topics',
    notebooks: [
      {
        title: 'Prefill/Decode Disaggregation',
        description:
          'Deploy separate prefill and decode workers and benchmark against a unified setup.',
        difficulty: 'Advanced',
        time: '60 min',
      },
      {
        title: 'Multi‑Model Serving with Flow Control',
        description:
          'Serve multiple models with tenant isolation and priority dispatch.',
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
              Learn by running real notebooks. Follow along step by step to deploy{' '}
              <span style={{ whiteSpace: 'nowrap' }}>llm&#x2011;d</span>, compare
              routing strategies, tune autoscaling, and explore disaggregated
              inference.
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
            commentary you need to go from zero to a working result. Pick a
            category below or start with the Getting Started series if this is
            your first time.
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
