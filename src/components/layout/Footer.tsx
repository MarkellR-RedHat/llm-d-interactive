import { Link } from 'react-router-dom'
import { GitBranch, ExternalLink } from 'lucide-react'

const footerLinks = [
  {
    title: 'Tools',
    links: [
      { label: 'Deployment Configurator', path: '/configurator' },
      { label: 'Routing Visualizer', path: '/routing' },
      { label: 'Capacity Planner', path: '/capacity' },
    ],
  },
  {
    title: 'Reference',
    links: [
      { label: 'Architecture Explorer', path: '/architecture' },
      { label: 'Migration Guide', path: '/migration' },
      { label: 'Troubleshooting', path: '/troubleshooting' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Learn llm-d', path: '/learn' },
      { label: 'GitHub', path: 'https://github.com/llm-d/llm-d', external: true },
      { label: 'Documentation', path: 'https://llm-d.github.io/llm-d-docs/', external: true },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-rh-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-rh-red rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-extrabold text-sm">d</span>
              </div>
              <span className="font-display font-bold text-xl tracking-tight">llm-d</span>
            </div>
            <p className="text-rh-gray-400 text-sm leading-relaxed">
              The open source platform for serving large language models at scale with intelligent routing,
              disaggregated serving, and production-grade reliability.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://github.com/llm-d/llm-d"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rh-gray-400 hover:text-white transition-colors"
              >
                <GitBranch className="w-5 h-5" />
              </a>
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-rh-gray-400 mb-4">
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-rh-gray-300 hover:text-white text-sm transition-colors inline-flex items-center gap-1.5 no-underline"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="text-rh-gray-300 hover:text-white text-sm transition-colors no-underline"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-rh-gray-800 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-rh-gray-500 text-xs">
            llm-d is an open source project. Built for the community, by the community.
          </p>
          <p className="text-rh-gray-500 text-xs">
            Apache License 2.0
          </p>
        </div>
      </div>
    </footer>
  )
}
