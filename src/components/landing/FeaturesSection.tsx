import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Settings2,
  Network,
  Calculator,
  Layers3,
  ArrowRightLeft,
  Search,
  ArrowRight,
} from 'lucide-react'

const tools = [
  {
    icon: Settings2,
    title: 'Deployment Configurator',
    what: 'Walk through your model, hardware, and workload choices step by step.',
    learn: 'How Helm values, routing policies, and autoscaling thresholds connect to each other.',
    path: '/configurator',
    bgColor: 'bg-rh-red-50',
    iconColor: 'text-rh-red',
    linkColor: 'text-rh-red',
  },
  {
    icon: Network,
    title: 'Routing Visualizer',
    what: 'See animated requests flowing across replicas under different routing policies.',
    learn: 'Why prefix-aware routing outperforms round-robin for cached workloads, and when it does not.',
    path: '/routing',
    bgColor: 'bg-blue-50',
    iconColor: 'text-rh-blue',
    linkColor: 'text-rh-blue',
  },
  {
    icon: Calculator,
    title: 'Capacity Planner',
    what: 'Describe your throughput and latency targets, then explore the tradeoffs.',
    learn: 'How GPU count, tensor parallelism, and disaggregation ratios affect cost and performance.',
    path: '/capacity',
    bgColor: 'bg-teal-50',
    iconColor: 'text-rh-teal',
    linkColor: 'text-rh-teal',
  },
  {
    icon: Layers3,
    title: 'Architecture Explorer',
    what: 'Click through an interactive diagram of every llm-d component.',
    learn: 'What the scheduler, router, prefill workers, decode workers, and KV cache each do, and how they connect.',
    path: '/architecture',
    bgColor: 'bg-purple-50',
    iconColor: 'text-rh-purple',
    linkColor: 'text-rh-purple',
  },
  {
    icon: ArrowRightLeft,
    title: 'Migration Guide',
    what: 'Side-by-side comparison for vLLM, TGI, and Triton users.',
    learn: 'How llm-d concepts map to what you already know, and what changes in your config.',
    path: '/migration',
    bgColor: 'bg-amber-50',
    iconColor: 'text-rh-gold',
    linkColor: 'text-rh-gold',
  },
  {
    icon: Search,
    title: 'Troubleshooting',
    what: 'Walk through interactive decision trees for common issues.',
    learn: 'How to diagnose latency spikes, OOM errors, and throughput drops systematically.',
    path: '/troubleshooting',
    bgColor: 'bg-green-50',
    iconColor: 'text-rh-green',
    linkColor: 'text-rh-green',
  },
]

function ToolCard({
  tool,
  index,
}: {
  tool: (typeof tools)[0]
  index: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link
        to={tool.path}
        className="group block p-10 rounded-2xl bg-white border border-rh-gray-100 hover:border-rh-gray-200 hover:shadow-lg transition-all duration-300 h-full no-underline"
      >
        <div
          className={`w-14 h-14 rounded-xl ${tool.bgColor} flex items-center justify-center mb-8 group-hover:scale-105 transition-transform duration-300`}
        >
          <tool.icon className={`w-7 h-7 ${tool.iconColor}`} />
        </div>

        <h3 className="font-display font-bold text-xl text-rh-black mb-4">
          {tool.title}
        </h3>

        <p className="text-rh-gray-600 text-[15px] leading-relaxed mb-3">
          {tool.what}
        </p>

        <p className="text-rh-gray-500 text-sm leading-relaxed mb-8">
          <span className="font-medium text-rh-gray-700">You will learn:</span>{' '}
          {tool.learn}
        </p>

        <div
          className={`inline-flex items-center gap-2 text-sm font-medium ${tool.linkColor} group-hover:gap-3 transition-all duration-300`}
        >
          Explore
          <ArrowRight className="w-4 h-4" />
        </div>
      </Link>
    </motion.div>
  )
}

export default function FeaturesSection() {
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-80px' })

  return (
    <section className="py-28 lg:py-36 bg-rh-gray-50">
      <div className="max-w-6xl mx-auto px-8 lg:px-12">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-20"
        >
          <p className="text-rh-red text-sm font-medium tracking-wide uppercase mb-4">
            Interactive tools
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-rh-black mb-6 leading-tight">
            Explore, experiment, understand
          </h2>
          <p className="text-rh-gray-600 text-lg max-w-2xl leading-relaxed">
            Each tool is designed to help you build intuition for a specific part of
            llm-d. Use them on their own or work through them in order.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, index) => (
            <ToolCard key={tool.title} tool={tool} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
