import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, GitBranch } from 'lucide-react'

export default function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="py-24 lg:py-32 bg-rh-black relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rh-red/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-rh-blue/8 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white mb-6">
            Ready to deploy?
          </h2>
          <p className="text-rh-gray-400 text-lg max-w-xl mx-auto mb-10">
            Start with the configurator to generate your deployment, or dive into the docs
            to understand the platform from the ground up.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/configurator"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-rh-red text-white font-semibold rounded-xl hover:bg-rh-red-dark transition-all shadow-lg shadow-rh-red/25 no-underline"
            >
              Open Configurator
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/learn"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/15 transition-all border border-white/10 no-underline"
            >
              <BookOpen className="w-4 h-4" />
              Read the Guide
            </Link>
            <a
              href="https://github.com/llm-d/llm-d"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/15 transition-all border border-white/10 no-underline"
            >
              <GitBranch className="w-4 h-4" />
              View Source
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
