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
    desc: 'Walk through your model, hardware, and workload choices to generate a complete deployment config.',
    path: '/configurator',
  },
  {
    icon: Network,
    title: 'Routing Visualizer',
    desc: 'See animated requests flowing across replicas and learn why one routing strategy beats another.',
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
    <section style={{ backgroundColor: '#fff', padding: '80px 0 100px' }}>
      <div style={{ maxWidth: '1244px', margin: '0 auto', padding: '0 30px' }}>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          style={{ textAlign: 'center', marginBottom: '20px' }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '44px',
              lineHeight: '110%',
              fontWeight: 600,
              color: '#151515',
              marginBottom: '10px',
            }}
          >
            Guides &amp; Tools
          </h2>
          <p style={{ fontSize: '18px', color: '#4D4D4D', lineHeight: '28px', maxWidth: '540px', margin: '0 auto' }}>
            Everything you need to understand, configure, and operate llm-d.
          </p>
        </motion.div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            margin: '0 -15px',
          }}
        >
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              style={{
                flex: '0 0 33.33%',
                maxWidth: '33.33%',
                padding: '15px',
              }}
              className="features-card-col"
            >
              <Link
                to={item.path}
                style={{
                  display: 'block',
                  padding: '40px',
                  backgroundColor: '#F0F0F0',
                  color: '#151515',
                  textAlign: 'center',
                  textDecoration: 'none',
                  height: '100%',
                  position: 'relative',
                  top: '0',
                  transition: 'ease 0.4s all',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.top = '-4px'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
                  e.currentTarget.style.backgroundColor = '#EAEAEA'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.top = '0'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.backgroundColor = '#F0F0F0'
                }}
              >
                <item.icon
                  style={{
                    width: '36px',
                    height: '36px',
                    color: '#EE0000',
                    marginBottom: '24px',
                    display: 'inline-block',
                  }}
                />
                <h4
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '24px',
                    lineHeight: '1.3',
                    marginBottom: '14px',
                    color: '#151515',
                  }}
                >
                  {item.title}
                </h4>
                <p
                  style={{
                    fontSize: '16px',
                    lineHeight: '26px',
                    color: '#4D4D4D',
                    margin: 0,
                  }}
                >
                  {item.desc}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .features-card-col {
            flex: 0 0 50% !important;
            max-width: 50% !important;
          }
        }
        @media (max-width: 640px) {
          .features-card-col {
            flex: 0 0 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </section>
  )
}
