import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const components = [
  {
    id: 'gateway',
    label: 'API Gateway',
    x: 50,
    y: 8,
    description: 'Receives incoming inference requests and forwards them to the scheduler for routing decisions.',
    color: '#EE0000',
  },
  {
    id: 'scheduler',
    label: 'Scheduler',
    x: 50,
    y: 28,
    description: 'Evaluates each request against the active routing policy and selects the best backend worker.',
    color: '#0066CC',
  },
  {
    id: 'prefill-1',
    label: 'Prefill Worker 1',
    x: 18,
    y: 52,
    description: 'Processes input prompt tokens in parallel. Optimized for the compute-heavy initial processing phase.',
    color: '#5E40BE',
  },
  {
    id: 'prefill-2',
    label: 'Prefill Worker 2',
    x: 50,
    y: 52,
    description: 'A second prefill worker that handles additional requests concurrently for higher throughput.',
    color: '#5E40BE',
  },
  {
    id: 'decode-1',
    label: 'Decode Worker',
    x: 82,
    y: 52,
    description: 'Generates output tokens one at a time. Optimized for memory bandwidth rather than compute.',
    color: '#009596',
  },
  {
    id: 'kv-cache',
    label: 'KV Cache Store',
    x: 50,
    y: 76,
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
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <section className="py-32 lg:py-40 bg-rh-gray-50">
      <div className="max-w-5xl mx-auto px-8 lg:px-12">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-20"
        >
          <p className="text-rh-red text-sm font-semibold tracking-wide uppercase mb-5">
            How it works
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-rh-black mb-8 leading-tight">
            Disaggregated inference, visualized
          </h2>
          <p className="text-rh-gray-600 text-lg max-w-xl leading-[1.8]">
            llm-d separates prefill and decode into independent workers that scale
            separately. Hover over each component to understand its role.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start"
        >
          <div className="lg:col-span-3 bg-white rounded-2xl p-12 lg:p-16 border border-rh-gray-100">
            <svg viewBox="0 0 100 88" className="w-full h-auto">
              {connections.map((conn) => {
                const from = components.find((c) => c.id === conn.from)!
                const to = components.find((c) => c.id === conn.to)!
                const lit = hovered === conn.from || hovered === conn.to
                return (
                  <motion.line
                    key={`${conn.from}-${conn.to}`}
                    x1={from.x}
                    y1={from.y + 6}
                    x2={to.x}
                    y2={to.y - 6}
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
                      x={comp.x - 16}
                      y={comp.y - 5.5}
                      width={32}
                      height={11}
                      rx={2}
                      fill={isHovered ? comp.color : 'white'}
                      stroke={comp.color}
                      strokeWidth={0.3}
                    />
                    <text
                      x={comp.x}
                      y={comp.y + 1.5}
                      textAnchor="middle"
                      fontSize={2.4}
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

          <div className="lg:col-span-2 flex flex-col justify-center lg:pt-8">
            {hovered ? (
              <motion.div
                key={hovered}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="w-4 h-4 rounded-full mb-6"
                  style={{ backgroundColor: components.find((c) => c.id === hovered)?.color }}
                />
                <h3 className="font-display font-bold text-xl text-rh-black mb-5 leading-snug">
                  {components.find((c) => c.id === hovered)?.label}
                </h3>
                <p className="text-rh-gray-600 text-[15px] leading-[1.8]">
                  {components.find((c) => c.id === hovered)?.description}
                </p>
              </motion.div>
            ) : (
              <div>
                <p className="text-rh-gray-500 text-[15px] leading-[1.8] mb-10">
                  Hover over any component in the diagram to learn what it does
                  and how it fits into the system.
                </p>
                <Link
                  to="/architecture"
                  className="inline-flex items-center gap-2.5 text-sm font-semibold text-rh-red hover:text-rh-red-dark transition-colors no-underline"
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
