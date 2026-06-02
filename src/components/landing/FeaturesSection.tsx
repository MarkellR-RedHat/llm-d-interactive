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

const features = [
  {
    icon: Settings2,
    title: 'Deployment Configurator',
    description:
      'Generate production-ready Helm values, routing policies, and autoscaling configs. Pick your model, hardware, and workload profile, and get a complete deployment in seconds.',
    path: '/configurator',
    color: 'rh-red',
    bgColor: 'bg-rh-red-50',
    iconColor: 'text-rh-red',
  },
  {
    icon: Network,
    title: 'Routing Visualizer',
    description:
      'Watch requests flow through your cluster in real time. Toggle between prefix-aware, load-based, session-affinity, and KV-cache-aware routing to build intuition for tuning.',
    path: '/routing',
    color: 'rh-blue',
    bgColor: 'bg-blue-50',
    iconColor: 'text-rh-blue',
  },
  {
    icon: Calculator,
    title: 'Capacity Planner',
    description:
      'Tell us your target throughput and latency. We calculate the GPUs, topology, and cost. Drag the sliders and watch resources adjust in real time.',
    path: '/capacity',
    color: 'rh-teal',
    bgColor: 'bg-teal-50',
    iconColor: 'text-rh-teal',
  },
  {
    icon: Layers3,
    title: 'Architecture Explorer',
    description:
      'Interactive diagram of every llm-d component. Click through the scheduler, router, prefill/decode workers, and KV cache to understand what each does and how to configure it.',
    path: '/architecture',
    color: 'rh-purple',
    bgColor: 'bg-purple-50',
    iconColor: 'text-rh-purple',
  },
  {
    icon: ArrowRightLeft,
    title: 'Migration Guide',
    description:
      'Moving from vLLM, TGI, or Triton? Side-by-side config comparison, concept mapping, and step-by-step instructions to make the switch painless.',
    path: '/migration',
    color: 'rh-gold',
    bgColor: 'bg-amber-50',
    iconColor: 'text-rh-gold',
  },
  {
    icon: Search,
    title: 'Troubleshooting',
    description:
      'Latency spikes? OOM errors? Throughput drops? Walk through an interactive decision tree that takes you straight to the fix.',
    path: '/troubleshooting',
    color: 'rh-green',
    bgColor: 'bg-green-50',
    iconColor: 'text-rh-green',
  },
]

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0]
  index: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        to={feature.path}
        className="group block p-8 rounded-2xl bg-white border border-rh-gray-100 hover:border-rh-gray-200 hover:shadow-xl transition-all duration-300 h-full no-underline"
      >
        <div
          className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
        >
          <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
        </div>

        <h3 className="font-display font-bold text-xl text-rh-black mb-3">
          {feature.title}
        </h3>

        <p className="text-rh-gray-600 text-sm leading-relaxed mb-6">
          {feature.description}
        </p>

        <div
          className={`inline-flex items-center gap-2 text-sm font-medium ${feature.iconColor} group-hover:gap-3 transition-all duration-300`}
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
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' })

  return (
    <section className="py-24 lg:py-32 bg-rh-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-rh-black mb-4">
            Everything you need to deploy,
            <br className="hidden sm:block" />
            operate, and optimize
          </h2>
          <p className="text-rh-gray-600 text-lg max-w-2xl mx-auto">
            Interactive tools that turn complex deployment decisions into guided,
            visual workflows. No guesswork, no trial and error.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
