import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'

const components = [
  {
    id: 'gateway',
    label: 'API Gateway',
    x: 50,
    y: 15,
    description: 'Receives incoming inference requests and routes them to the scheduler.',
    color: '#EE0000',
  },
  {
    id: 'scheduler',
    label: 'Scheduler',
    x: 50,
    y: 35,
    description: 'Decides which backend handles each request based on the active routing policy.',
    color: '#0066CC',
  },
  {
    id: 'prefill-1',
    label: 'Prefill Worker',
    x: 20,
    y: 58,
    description: 'Processes the input prompt tokens. Optimized for compute-heavy initial processing.',
    color: '#5E40BE',
  },
  {
    id: 'prefill-2',
    label: 'Prefill Worker',
    x: 50,
    y: 58,
    description: 'A second prefill worker for parallel prompt processing across requests.',
    color: '#5E40BE',
  },
  {
    id: 'decode-1',
    label: 'Decode Worker',
    x: 80,
    y: 58,
    description: 'Generates output tokens autoregressively, optimized for memory bandwidth.',
    color: '#009596',
  },
  {
    id: 'kv-cache',
    label: 'KV Cache',
    x: 50,
    y: 80,
    description: 'Shared key-value cache that stores attention state across disaggregated workers.',
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
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null)

  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-rh-black mb-4">
            Built for disaggregated inference
          </h2>
          <p className="text-rh-gray-600 text-lg max-w-2xl mx-auto">
            llm-d separates prefill and decode into independent, scalable workers
            connected through a shared KV cache. Hover over each component to learn more.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="bg-rh-gray-50 rounded-3xl p-8 lg:p-12 border border-rh-gray-100">
            <svg viewBox="0 0 100 95" className="w-full h-auto">
              {connections.map((conn) => {
                const from = components.find((c) => c.id === conn.from)!
                const to = components.find((c) => c.id === conn.to)!
                const isHighlighted =
                  hoveredComponent === conn.from || hoveredComponent === conn.to
                return (
                  <motion.line
                    key={`${conn.from}-${conn.to}`}
                    x1={from.x}
                    y1={from.y + 4}
                    x2={to.x}
                    y2={to.y - 4}
                    stroke={isHighlighted ? '#EE0000' : '#D2D2D2'}
                    strokeWidth={isHighlighted ? 0.4 : 0.2}
                    strokeDasharray={isHighlighted ? '' : '1 1'}
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  />
                )
              })}

              {components.map((comp, i) => (
                <motion.g
                  key={comp.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  onMouseEnter={() => setHoveredComponent(comp.id)}
                  onMouseLeave={() => setHoveredComponent(null)}
                  className="cursor-pointer"
                >
                  <rect
                    x={comp.x - 12}
                    y={comp.y - 4}
                    width={24}
                    height={8}
                    rx={1.5}
                    fill={hoveredComponent === comp.id ? comp.color : 'white'}
                    stroke={comp.color}
                    strokeWidth={0.3}
                  />
                  <text
                    x={comp.x}
                    y={comp.y + 0.8}
                    textAnchor="middle"
                    fontSize={2}
                    fontWeight={600}
                    fill={hoveredComponent === comp.id ? 'white' : comp.color}
                    fontFamily="Red Hat Display, sans-serif"
                  >
                    {comp.label}
                  </text>
                </motion.g>
              ))}
            </svg>

            {hoveredComponent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-white rounded-xl border border-rh-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: components.find(
                        (c) => c.id === hoveredComponent
                      )?.color,
                    }}
                  />
                  <span className="font-display font-bold text-rh-black">
                    {components.find((c) => c.id === hoveredComponent)?.label}
                  </span>
                </div>
                <p className="text-sm text-rh-gray-600 mt-2">
                  {components.find((c) => c.id === hoveredComponent)?.description}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
