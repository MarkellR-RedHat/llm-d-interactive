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

const socialLinks = [
  { label: 'GitHub', url: 'https://github.com/llm-d/llm-d' },
  { label: 'Discussions', url: 'https://github.com/llm-d/llm-d/discussions' },
  { label: 'Documentation', url: 'https://llm-d.github.io/llm-d-docs/' },
]

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#151515', padding: '100px 0 0' }}>
      {/* Main footer content */}
      <div
        style={{
          maxWidth: '1244px',
          margin: '0 auto',
          padding: '0 30px',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '60px',
        }}
        className="footer-grid"
      >
        {/* Logo / info on left */}
        <div style={{ flex: '0 0 280px', maxWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#EE0000',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  color: '#fff',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '18px',
                }}
              >
                d
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '22px',
                color: '#fff',
                letterSpacing: '-0.01em',
              }}
            >
              llm-d
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#8A8D90', lineHeight: '22px' }}>
            An open source platform for serving large language models on Kubernetes
            with disaggregated inference and intelligent routing.
          </p>
        </div>

        {/* Link columns in middle */}
        {footerLinks.map((group) => (
          <div key={group.title} style={{ flex: '0 0 auto', minWidth: '150px' }}>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#8A8D90',
                marginBottom: '24px',
              }}
            >
              {group.title}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {group.links.map((link) => (
                <li key={link.label} style={{ marginBottom: '14px' }}>
                  {'external' in link && link.external ? (
                    <a
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#B8BBBE',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'color 0.3s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#B8BBBE')}
                    >
                      {link.label}
                      <ExternalLink style={{ width: '11px', height: '11px' }} />
                    </a>
                  ) : (
                    <Link
                      to={link.path}
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#B8BBBE',
                        textDecoration: 'none',
                        transition: 'color 0.3s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#B8BBBE')}
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

      {/* Divider */}
      <div
        style={{
          maxWidth: '1244px',
          margin: '60px auto 0',
          padding: '0 30px',
        }}
      >
        <div style={{ borderTop: '1px solid #292929' }} />
      </div>

      {/* Connect with us / social row */}
      <div
        style={{
          maxWidth: '1244px',
          margin: '0 auto',
          padding: '30px 30px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#8A8D90',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Connect with us
          </span>
          {socialLinks.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#B8BBBE',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#B8BBBE')}
            >
              {s.label}
            </a>
          ))}
        </div>

        <p style={{ fontSize: '13px', color: '#6A6E73' }}>
          llm-d is an open source project. Apache License 2.0.
        </p>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            flex-direction: column !important;
            gap: 40px !important;
          }
          .footer-grid > div {
            flex: 0 0 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </footer>
  )
}
