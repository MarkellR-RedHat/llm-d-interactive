import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, ChevronDown, ExternalLink } from 'lucide-react'

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Learn', path: '/learn' },
  {
    label: 'Tools',
    children: [
      { label: 'Deployment Configurator', path: '/configurator', desc: 'Walk through your deployment options' },
      { label: 'Routing Visualizer', path: '/routing', desc: 'Understand how routing policies work' },
      { label: 'Capacity Planner', path: '/capacity', desc: 'Explore resource and cost tradeoffs' },
    ],
  },
  {
    label: 'Reference',
    children: [
      { label: 'Architecture Explorer', path: '/architecture', desc: 'Interactive component diagram' },
      { label: 'Migration Guide', path: '/migration', desc: 'Coming from vLLM, TGI, or Triton' },
      { label: 'Troubleshooting', path: '/troubleshooting', desc: 'Diagnose and fix common issues' },
    ],
  },
  { label: 'Notebooks', path: '/notebooks' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path: string) => location.pathname === path

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
        backgroundColor: '#fff',
        transition: 'ease 0.4s all',
        boxShadow: scrolled ? '0 2px 10px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      {/* Top bar: logo + subtitle */}
      <div
        style={{
          maxWidth: '1244px',
          margin: '0 auto',
          padding: scrolled ? '8px 30px' : '16px 30px',
          transition: 'ease 0.4s all',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img src="/llm-d-interactive/llm-d-icon.png" alt="llm-d" style={{ width: '36px', height: '36px' }} />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '22px',
                color: '#151515',
                letterSpacing: '-0.01em',
              }}
            >
              llm-d
            </span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: '16px',
                color: '#6A6E73',
                fontStyle: 'italic',
              }}
            >
              Learning Center
            </span>
          </div>
        </Link>

        {/* GitHub link (top right, desktop) */}
        <div className="hidden lg:flex" style={{ alignItems: 'center' }}>
          <a
            href="https://github.com/llm-d/llm-d"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#3C3F42',
              textDecoration: 'none',
            }}
          >
            GitHub
            <ExternalLink style={{ width: '13px', height: '13px' }} />
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: '#3C3F42',
          }}
        >
          {mobileOpen ? <X style={{ width: '24px', height: '24px' }} /> : <Menu style={{ width: '24px', height: '24px' }} />}
        </button>
      </div>

      {/* Nav bar below logo (desktop) */}
      <div
        className="hidden lg:block"
        style={{
          borderTop: '1px solid #E0E0E0',
          backgroundColor: '#fff',
        }}
      >
        <nav
          style={{
            maxWidth: '1244px',
            margin: '0 auto',
            padding: '0 30px',
            display: 'flex',
            alignItems: 'center',
            gap: '0',
          }}
        >
          {navItems.map((item) =>
            'children' in item && item.children ? (
              <div
                key={item.label}
                style={{ position: 'relative' }}
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '14px 20px',
                    fontSize: '15px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-body)',
                    color: openDropdown === item.label ? '#9b4d9b' : '#3C3F42',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                    borderBottom: '3px solid transparent',
                  }}
                >
                  {item.label}
                  <ChevronDown style={{ width: '14px', height: '14px' }} />
                </button>
                <AnimatePresence>
                  {openDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        minWidth: '300px',
                        backgroundColor: '#fff',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                        border: '1px solid #E0E0E0',
                        zIndex: 1001,
                      }}
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          style={{
                            display: 'block',
                            padding: '14px 20px',
                            textDecoration: 'none',
                            borderBottom: '1px solid #F0F0F0',
                            backgroundColor: isActive(child.path) ? '#f3e8f3' : 'transparent',
                            transition: 'background-color 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive(child.path)) e.currentTarget.style.backgroundColor = '#f7f7f7'
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive(child.path)) e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          <div
                            style={{
                              fontSize: '14px',
                              fontWeight: 600,
                              color: isActive(child.path) ? '#9b4d9b' : '#151515',
                              marginBottom: '3px',
                            }}
                          >
                            {child.label}
                          </div>
                          <div
                            style={{
                              fontSize: '13px',
                              color: '#6A6E73',
                              lineHeight: '1.4',
                            }}
                          >
                            {child.desc}
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={item.label}
                to={item.path!}
                style={{
                  display: 'block',
                  padding: '14px 20px',
                  fontSize: '15px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  color: isActive(item.path!) ? '#9b4d9b' : '#3C3F42',
                  textDecoration: 'none',
                  borderBottom: isActive(item.path!) ? '3px solid #9b4d9b' : '3px solid transparent',
                  transition: 'color 0.3s ease',
                }}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden"
            style={{
              borderTop: '1px solid #E0E0E0',
              backgroundColor: '#fff',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '16px 30px' }}>
              {navItems.map((item) =>
                'children' in item && item.children ? (
                  <div key={item.label} style={{ marginBottom: '16px' }}>
                    <div
                      style={{
                        padding: '8px 0',
                        fontSize: '12px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: '#8A8D90',
                      }}
                    >
                      {item.label}
                    </div>
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={() => setMobileOpen(false)}
                        style={{
                          display: 'block',
                          padding: '10px 12px',
                          fontSize: '15px',
                          fontWeight: isActive(child.path) ? 600 : 400,
                          color: isActive(child.path) ? '#9b4d9b' : '#3C3F42',
                          textDecoration: 'none',
                          backgroundColor: isActive(child.path) ? '#f3e8f3' : 'transparent',
                          borderRadius: '4px',
                        }}
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
                    style={{
                      display: 'block',
                      padding: '10px 12px',
                      fontSize: '15px',
                      fontWeight: isActive(item.path!) ? 600 : 400,
                      color: isActive(item.path!) ? '#9b4d9b' : '#3C3F42',
                      textDecoration: 'none',
                      backgroundColor: isActive(item.path!) ? '#f3e8f3' : 'transparent',
                      borderRadius: '4px',
                    }}
                  >
                    {item.label}
                  </Link>
                )
              )}
              <a
                href="https://github.com/llm-d/llm-d"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 12px',
                  fontSize: '15px',
                  fontWeight: 400,
                  color: '#3C3F42',
                  textDecoration: 'none',
                }}
              >
                GitHub
                <ExternalLink style={{ width: '13px', height: '13px' }} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
