import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown } from 'lucide-react'

const navItems = [
  { label: 'Learn', path: '/learn' },
  {
    label: 'Tools',
    children: [
      { label: 'Deployment Configurator', path: '/configurator', desc: 'Generate production-ready configs' },
      { label: 'Routing Visualizer', path: '/routing', desc: 'See how routing policies work' },
      { label: 'Capacity Planner', path: '/capacity', desc: 'Calculate what you need' },
    ],
  },
  {
    label: 'Reference',
    children: [
      { label: 'Architecture Explorer', path: '/architecture', desc: 'Interactive component diagram' },
      { label: 'Migration Guide', path: '/migration', desc: 'Switch from vLLM, TGI, or Triton' },
      { label: 'Troubleshooting', path: '/troubleshooting', desc: 'Diagnose and fix issues' },
    ],
  },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-rh-white/90 backdrop-blur-xl border-b border-rh-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="w-8 h-8 bg-rh-red rounded-lg flex items-center justify-center">
              <span className="text-white font-display font-extrabold text-sm">d</span>
            </div>
            <span className="font-display font-bold text-xl text-rh-black tracking-tight">
              llm-d
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              'children' in item && item.children ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-rh-gray-700 hover:text-rh-red transition-colors rounded-lg hover:bg-rh-red-50">
                    {item.label}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <AnimatePresence>
                    {openDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-rh-gray-100 overflow-hidden"
                      >
                        <div className="p-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.path}
                              to={child.path}
                              className={`block px-4 py-3 rounded-lg transition-all no-underline ${
                                isActive(child.path)
                                  ? 'bg-rh-red-50 text-rh-red'
                                  : 'text-rh-gray-700 hover:bg-rh-gray-50'
                              }`}
                            >
                              <div className="font-medium text-sm">{child.label}</div>
                              <div className="text-xs text-rh-gray-500 mt-0.5">{child.desc}</div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={item.label}
                  to={item.path!}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors no-underline ${
                    isActive(item.path!)
                      ? 'text-rh-red bg-rh-red-50'
                      : 'text-rh-gray-700 hover:text-rh-red hover:bg-rh-red-50'
                  }`}
                >
                  {item.label}
                </Link>
              )
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <a
              href="https://github.com/llm-d/llm-d"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium text-rh-gray-700 hover:text-rh-black transition-colors no-underline"
            >
              GitHub
            </a>
            <Link
              to="/configurator"
              className="px-5 py-2 bg-rh-red text-white text-sm font-semibold rounded-lg hover:bg-rh-red-dark transition-all shadow-sm hover:shadow-md no-underline"
            >
              Get Started
            </Link>
          </div>

          <button
            className="lg:hidden p-2 text-rh-gray-700 hover:text-rh-red transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-rh-gray-100 bg-white overflow-hidden"
          >
            <div className="px-6 py-4 space-y-1">
              {navItems.map((item) => (
                'children' in item && item.children ? (
                  <div key={item.label}>
                    <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-rh-gray-400">
                      {item.label}
                    </div>
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={() => setMobileOpen(false)}
                        className={`block px-4 py-2.5 rounded-lg text-sm no-underline ${
                          isActive(child.path)
                            ? 'bg-rh-red-50 text-rh-red font-medium'
                            : 'text-rh-gray-700'
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    to={item.path!}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-2.5 rounded-lg text-sm no-underline ${
                      isActive(item.path!)
                        ? 'bg-rh-red-50 text-rh-red font-medium'
                        : 'text-rh-gray-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              ))}
              <div className="pt-4 border-t border-rh-gray-100">
                <Link
                  to="/configurator"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full px-5 py-3 bg-rh-red text-white text-sm font-semibold rounded-lg text-center no-underline"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
