import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, GitBranch, FileText, MessageCircle } from 'lucide-react'

const resources = [
  {
    icon: BookOpen,
    title: 'Learning Center',
    desc: 'Start from the beginning. Understand what llm-d is, why it exists, and how each piece fits together.',
    path: '/learn',
    internal: true,
  },
  {
    icon: FileText,
    title: 'Documentation',
    desc: 'Full reference documentation for installation, configuration, API, and operations.',
    path: 'https://llm-d.github.io/llm-d-docs/',
    internal: false,
  },
  {
    icon: GitBranch,
    title: 'Source Code',
    desc: 'Browse the codebase, open issues, or contribute. llm-d is Apache 2.0 licensed.',
    path: 'https://github.com/llm-d/llm-d',
    internal: false,
  },
  {
    icon: MessageCircle,
    title: 'Community',
    desc: 'Ask questions, share what you have built, and connect with other llm-d users and contributors.',
    path: 'https://github.com/llm-d/llm-d/discussions',
    internal: false,
  },
]

export default function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-28 lg:py-36 bg-rh-black relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rh-red/6 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-rh-blue/4 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-6xl mx-auto px-8 lg:px-12 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-16"
        >
          <p className="text-rh-red text-sm font-medium tracking-wide uppercase mb-4">
            Resources
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-6 leading-tight">
            Keep going
          </h2>
          <p className="text-rh-gray-400 text-lg max-w-xl leading-relaxed">
            Whether you are just getting started or looking for something specific,
            these resources will help you find what you need.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {resources.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
            >
              {r.internal ? (
                <Link
                  to={r.path}
                  className="group block p-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.14] transition-all duration-300 no-underline h-full"
                >
                  <r.icon className="w-6 h-6 text-rh-gray-400 group-hover:text-rh-red transition-colors mb-6" />
                  <h3 className="font-display font-bold text-lg text-white mb-3">{r.title}</h3>
                  <p className="text-sm text-rh-gray-400 leading-relaxed">{r.desc}</p>
                </Link>
              ) : (
                <a
                  href={r.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.14] transition-all duration-300 no-underline h-full"
                >
                  <r.icon className="w-6 h-6 text-rh-gray-400 group-hover:text-rh-red transition-colors mb-6" />
                  <h3 className="font-display font-bold text-lg text-white mb-3">{r.title}</h3>
                  <p className="text-sm text-rh-gray-400 leading-relaxed">{r.desc}</p>
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
