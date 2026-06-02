import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const components = [
  {
    id: 'gateway',
    label: 'API Gateway',
    x: 50,
    y: 10,
    description: 'Receives incoming inference requests and forwards them to the scheduler for routing decisions.',
    color: '#EE0000',
  },
  {
    id: 'scheduler',
    label: 'Scheduler',
    x: 50,
    y: 30,
    description: 'Evaluates each request against the active routing policy and selects the best backend worker.',
    color: '#0066CC',
  },
  {
    id: 'prefill-1',
    label: 'Prefill Worker 1',
    x: 18,
    y: 55,
    description: 'Processes input prompt tokens in parallel. Optimized for the compute-heavy initial processing phase.',
    color: '#5E40BE',
  },
  {
    id: 'prefill-2',
    label: 'Prefill Worker 2',
    x: 50,
    y: 55,
    description: 'A second prefill worker that handles additional requests concurrently for higher throughput.',
    color: '#5E40BE',
  },
  {
    id: 'decode-1',
    label: 'Decode Worker',
    x: 82,
    y: 55,
    description: 'Generates output tokens one at a time. Optimized for memory bandwidth rather than compute.',
    color: '#009596',
  },
  {
    id: 'kv-cache',
    label: 'KV Cache Store',
    x: 50,
    y: 80,
    description: 'Shared key-value cache that holds attention state so it can be reused across disaggregated workers.',
    color: '#F0AB00',
  },
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
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <section className="py-28 lg:py-36 bg-white">
      <div className="max-w-6xl mx-auto px-8 lg:px-12">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-16"
        >
          <p className="text-rh-red text-sm font-medium tracking-wide uppercase mb-4">
            How it works
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-rh-black mb-6 leading-tight">
            Disaggregated inference, visualized
          </h2>
          <p className="text-rh-gray-600 text-lg max-w-2xl leading-relaxed">
            llm-d separates prefill and decode into independent workers that scale
            separately. Hover over each component to understand its role.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-8"
        >
          <div className="lg:col-span-3 bg-rh-gray-50 rounded-2xl p-10 lg:p-14 border border-rh-gray-100">
            <svg viewBox="0 0 100 95" className="w-full h-auto">
              {connections.map((conn) => {
                const from = components.find((c) => c.id === conn.from)!
                const to = components.find((c) => c.id === conn.to)!
                const lit = hovered === conn.from || hovered === conn.to
                return (
                  <motion.line
                    key={`${conn.from}-${conn.to}`}
                    x1={from.x}
                    y1={from.y + 5}
                    x2={to.x}
                    y2={to.y - 5}
                    stroke={lit ? '#EE0000' : '#D2D2D2'}
                    strokeWidth={lit ? 0.4 : 0.2}
                    strokeDasharray={lit ? '' : '1.5 1.5'}
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  />
                )
              })}

              {components.map((comp, i) => {
                const isHovered = hovered === comp.id
                return (
                  <motion.g
                    key={comp.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.35, delay: 0.25 + i * 0.08 }}
                    onMouseEnter={() => setHovered(comp.id)}
                    onMouseLeave={() => setHovered(null)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={comp.x - 15}
                      y={comp.y - 5}
                      width={30}
                      height={10}
                      rx={2}
                      fill={isHovered ? comp.color : 'white'}
                      stroke={comp.color}
                      strokeWidth={0.3}
                    />
                    <text
                      x={comp.x}
                      y={comp.y + 1.2}
                      textAnchor="middle"
                      fontSize={2.2}
                      fontWeight={600}
                      fill={isHovered ? 'white' : comp.color}
                      fontFamily="Red Hat Display, sans-serif"
                    >
                      {comp.label}
                    </text>
                  </motion.g>
                )
              })}
            </svg>
          </div>

          <div className="lg:col-span-2 flex flex-col justify-center">
            {hovered ? (
              <motion.div
                key={hovered}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="w-4 h-4 rounded-full mb-4"
                  style={{ backgroundColor: components.find((c) => c.id === hovered)?.color }}
                />
                <h3 className="font-display font-bold text-xl text-rh-black mb-3">
                  {components.find((c) => c.id === hovered)?.label}
                </h3>
                <p className="text-rh-gray-600 text-[15px] leading-relaxed">
                  {components.find((c) => c.id === hovered)?.description}
                </p>
              </motion.div>
            ) : (
              <div className="text-rh-gray-400">
                <p className="text-[15px] leading-relaxed mb-8">
                  Hover over any component in the diagram to learn what it does
                  and how it fits into the system.
                </p>
                <Link
                  to="/architecture"
                  className="inline-flex items-center gap-2 text-sm font-medium text-rh-red hover:text-rh-red-dark transition-colors no-underline"
                >
                  Open full Architecture Explorer
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
