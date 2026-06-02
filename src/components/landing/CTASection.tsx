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
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="py-32 lg:py-40 bg-white border-t border-rh-gray-100">
      <div className="max-w-5xl mx-auto px-8 lg:px-12">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-20"
        >
          <p className="text-rh-red text-sm font-semibold tracking-wide uppercase mb-5">
            Resources
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-rh-black mb-8 leading-tight">
            Keep going
          </h2>
          <p className="text-rh-gray-600 text-lg max-w-xl leading-[1.8]">
            Whether you are just getting started or looking for something specific,
            these resources will help you find what you need.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {resources.map((r, i) => {
            const inner = (
              <div className="p-10 lg:p-12">
                <div className="w-12 h-12 rounded-xl bg-rh-gray-100 flex items-center justify-center mb-8 group-hover:bg-rh-red-50 transition-colors">
                  <r.icon className="w-5 h-5 text-rh-gray-500 group-hover:text-rh-red transition-colors" />
                </div>
                <h3 className="font-display font-bold text-lg text-rh-black mb-4">{r.title}</h3>
                <p className="text-sm text-rh-gray-600 leading-[1.75]">{r.desc}</p>
              </div>
            )

            return (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
              >
                {r.internal ? (
                  <Link
                    to={r.path}
                    className="group block rounded-2xl bg-rh-gray-50 border border-rh-gray-100 hover:border-rh-gray-200 hover:shadow-lg hover:bg-white transition-all duration-300 no-underline h-full"
                  >
                    {inner}
                  </Link>
                ) : (
                  <a
                    href={r.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-2xl bg-rh-gray-50 border border-rh-gray-100 hover:border-rh-gray-200 hover:shadow-lg hover:bg-white transition-all duration-300 no-underline h-full"
                  >
                    {inner}
                  </a>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
