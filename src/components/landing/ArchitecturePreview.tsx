import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const components = [
  { id: 'gateway', label: 'API Gateway', x: 50, y: 8, color: '#EE0000',
    description: 'Receives incoming inference requests and forwards them to the scheduler for routing decisions.' },
  { id: 'scheduler', label: 'Scheduler', x: 50, y: 28, color: '#0066CC',
    description: 'Evaluates each request against the active routing policy and selects the best backend worker.' },
  { id: 'prefill-1', label: 'Prefill Worker 1', x: 18, y: 52, color: '#5E40BE',
    description: 'Processes input prompt tokens in parallel. Optimized for the compute-heavy initial processing phase.' },
  { id: 'prefill-2', label: 'Prefill Worker 2', x: 50, y: 52, color: '#5E40BE',
    description: 'A second prefill worker that handles additional requests concurrently for higher throughput.' },
  { id: 'decode-1', label: 'Decode Worker', x: 82, y: 52, color: '#009596',
    description: 'Generates output tokens one at a time. Optimized for memory bandwidth rather than compute.' },
  { id: 'kv-cache', label: 'KV Cache Store', x: 50, y: 76, color: '#F0AB00',
    description: 'Shared key-value cache that holds attention state so it can be reused across disaggregated workers.' },
]

const connections = [
  { from: 'gateway', to: 'scheduler' },
  { from: 'scheduler', to: 'prefill-1' },
  { from: 'scheduler', to: 'prefill-2' },
  { from: 'scheduler', to: 'decode-1' },
  { from: 'prefill-1', to: 'kv-cache' },
  { from: 'prefill-2', to: 'kv-cache' },
  { from: 'decode-1', to: 'kv-cache' },
]

export default function ArchitecturePreview() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const [hovered, setHovered] = useState<string | null>(null)

  const active = hovered ? components.find(c => c.id === hovered) : null

  return (
    <section style={{ backgroundColor: '#f7f7f7', padding: '100px 0' }}>
      <div ref={ref} style={{ maxWidth: '1060px', margin: '0 auto', padding: '0 40px' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '64px' }}
        >
          <h2
            className="font-display"
            style={{ fontSize: '2rem', fontWeight: 700, color: '#151515', marginBottom: '16px' }}
          >
            How llm-d works
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#4D4D4D', lineHeight: 1.7, maxWidth: '560px' }}>
            llm-d separates prefill and decode into independent workers that scale separately,
            connected through a shared KV cache. Hover over each component to learn more.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '60px', alignItems: 'start' }}
          className="arch-grid"
        >
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '48px' }}>
            <svg viewBox="0 0 100 88" style={{ width: '100%', height: 'auto' }}>
              {connections.map(conn => {
                const from = components.find(c => c.id === conn.from)!
                const to = components.find(c => c.id === conn.to)!
                const lit = hovered === conn.from || hovered === conn.to
                return (
                  <line
                    key={`${conn.from}-${conn.to}`}
                    x1={from.x} y1={from.y + 6} x2={to.x} y2={to.y - 6}
                    stroke={lit ? '#EE0000' : '#D2D2D2'}
                    strokeWidth={lit ? 0.4 : 0.2}
                    strokeDasharray={lit ? '' : '1.5 1.5'}
                  />
                )
              })}
              {components.map(comp => {
                const isHovered = hovered === comp.id
                return (
                  <g
                    key={comp.id}
                    onMouseEnter={() => setHovered(comp.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect
                      x={comp.x - 16} y={comp.y - 5.5} width={32} height={11} rx={2}
                      fill={isHovered ? comp.color : 'white'}
                      stroke={comp.color} strokeWidth={0.3}
                    />
                    <text
                      x={comp.x} y={comp.y + 1.5} textAnchor="middle"
                      fontSize={2.4} fontWeight={600}
                      fill={isHovered ? 'white' : comp.color}
                      fontFamily="Red Hat Display, sans-serif"
                    >
                      {comp.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          <div style={{ paddingTop: '24px' }}>
            {active ? (
              <motion.div key={active.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: active.color, marginBottom: '20px' }} />
                <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#151515', marginBottom: '16px' }}>
                  {active.label}
                </h3>
                <p style={{ fontSize: '0.95rem', color: '#4D4D4D', lineHeight: 1.75 }}>
                  {active.description}
                </p>
              </motion.div>
            ) : (
              <div>
                <p style={{ fontSize: '0.95rem', color: '#6A6E73', lineHeight: 1.75, marginBottom: '32px' }}>
                  Hover over any component in the diagram to learn what it does and how it connects to the rest of the system.
                </p>
                <Link
                  to="/architecture"
                  className="font-display"
                  style={{ fontSize: '0.9rem', fontWeight: 600, color: '#EE0000', textDecoration: 'none' }}
                >
                  Open full Architecture Explorer &rarr;
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .arch-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
