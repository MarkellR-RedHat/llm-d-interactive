import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'

const footerLinks = [
  {
    title: 'Learn',
    links: [
      { label: 'Learning Center', path: '/learn' },
      { label: 'Notebooks', path: '/notebooks' },
      { label: 'Architecture Explorer', path: '/architecture' },
    ],
  },
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
      { label: 'Migration Guide', path: '/migration' },
      { label: 'Troubleshooting', path: '/troubleshooting' },
      { label: 'GitHub', path: 'https://github.com/llm-d/llm-d', external: true },
      { label: 'Documentation', path: 'https://llm-d.github.io/llm-d-docs/', external: true },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-rh-black text-white">
      <div className="max-w-5xl mx-auto px-8 lg:px-12">
        <div className="py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-rh-red rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-extrabold text-base">d</span>
              </div>
              <span className="font-display font-bold text-xl tracking-tight">llm-d</span>
            </div>
            <p className="text-rh-gray-400 text-sm leading-loose">
              An open source platform for serving large language models on Kubernetes
              with disaggregated inference and intelligent routing.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-rh-gray-400 mb-6">
                {group.title}
              </h3>
              <ul className="space-y-4">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-rh-gray-300 hover:text-white text-sm transition-colors inline-flex items-center gap-2 no-underline"
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

        <div className="border-t border-rh-gray-800 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-rh-gray-500 text-sm">
            llm-d is an open source project. Apache License 2.0.
          </p>
        </div>
      </div>
    </footer>
  )
}
