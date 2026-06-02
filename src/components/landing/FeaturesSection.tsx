import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Settings2,
  Network,
  Calculator,
  Layers3,
  ArrowRightLeft,
  Search,
  FlaskConical,
} from 'lucide-react'

const items = [
  {
    icon: BookOpen,
    title: 'Learning Center',
    desc: 'Understand what llm-d is, how disaggregated inference works, and why it matters for serving LLMs at scale.',
    path: '/learn',
  },
  {
    icon: Settings2,
    title: 'Deployment Configurator',
    desc: 'Walk through your model, hardware, and workload choices to generate a complete, ready-to-apply deployment config.',
    path: '/configurator',
  },
  {
    icon: Network,
    title: 'Routing Visualizer',
    desc: 'See animated requests flowing across replicas and learn why one routing strategy beats another for your workload.',
    path: '/routing',
  },
  {
    icon: Calculator,
    title: 'Capacity Planner',
    desc: 'Describe your throughput and latency targets, then explore how GPU count and topology affect cost.',
    path: '/capacity',
  },
  {
    icon: FlaskConical,
    title: 'Jupyter Notebooks',
    desc: 'Hands-on tutorials that walk you through real llm-d deployments, routing experiments, and tuning.',
    path: '/notebooks',
  },
  {
    icon: Layers3,
    title: 'Architecture Explorer',
    desc: 'Interactive diagram of every component in llm-d. Click through to understand what each piece does.',
    path: '/architecture',
  },
  {
    icon: ArrowRightLeft,
    title: 'Migration Guide',
    desc: 'Coming from vLLM, TGI, or Triton? See how concepts map and what changes in your config.',
    path: '/migration',
  },
  {
    icon: Search,
    title: 'Troubleshooting',
    desc: 'Walk through interactive decision trees for latency spikes, OOM errors, and throughput drops.',
    path: '/troubleshooting',
  },
]

export default function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section style={{ backgroundColor: '#fff', padding: '100px 0' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '0 40px' }}>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          style={{ textAlign: 'center', marginBottom: '80px' }}
        >
          <h2
            className="font-display"
            style={{ fontSize: '2rem', fontWeight: 700, color: '#151515', marginBottom: '16px' }}
          >
            Guides &amp; Tools
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#4D4D4D', lineHeight: 1.7, maxWidth: '540px', margin: '0 auto' }}>
            Everything you need to understand, configure, and operate llm-d.
          </p>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '32px',
          }}
        >
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <Link
                to={item.path}
                style={{
                  display: 'block',
                  padding: '40px 36px',
                  backgroundColor: '#f7f7f7',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  height: '100%',
                  transition: 'box-shadow 0.25s, background-color 0.25s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
                  e.currentTarget.style.backgroundColor = '#fff'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.backgroundColor = '#f7f7f7'
                }}
              >
                <item.icon
                  style={{ width: '28px', height: '28px', color: '#EE0000', marginBottom: '28px' }}
                />
                <h3
                  className="font-display"
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: '#151515',
                    marginBottom: '14px',
                    lineHeight: 1.3,
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#4D4D4D', lineHeight: 1.75, margin: 0 }}>
                  {item.desc}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
