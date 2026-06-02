import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'

const links = [
  { title: 'Learning Center', desc: 'Start from the beginning with guides for every level.', path: '/learn', internal: true },
  { title: 'Documentation', desc: 'Full reference for installation, configuration, and API.', path: 'https://llm-d.github.io/llm-d-docs/', internal: false },
  { title: 'Source Code', desc: 'Browse the codebase or contribute. Apache 2.0 licensed.', path: 'https://github.com/llm-d/llm-d', internal: false },
  { title: 'Community', desc: 'Ask questions and connect with other llm-d users.', path: 'https://github.com/llm-d/llm-d/discussions', internal: false },
]

export default function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section style={{ backgroundColor: '#fff', padding: '30px 0' }}>
      <div ref={ref} style={{ maxWidth: '1244px', margin: '0 auto', padding: '20px 30px' }}>
        {/* Callout style: flex with icon area and content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '60px',
            flexWrap: 'wrap',
          }}
          className="cta-layout"
        >
          {/* Left: icon/badge area (130px) */}
          <div
            className="cta-icon-area"
            style={{
              flex: '0 0 130px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: '8px',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#EE0000',
                borderRadius: '12px',
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
                  fontSize: '36px',
                }}
              >
                d
              </span>
            </div>
          </div>

          {/* Right: content */}
          <div style={{ flex: 1, minWidth: '0' }}>
            <h4
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '28px',
                color: '#151515',
                marginBottom: '12px',
                lineHeight: '1.3',
              }}
            >
              Resources
            </h4>
            <p
              style={{
                fontSize: '20px',
                lineHeight: '26px',
                color: '#4D4D4D',
                marginBottom: '32px',
                maxWidth: '560px',
              }}
            >
              Whether you are just starting out or looking for something specific,
              these resources will help you get the most out of <span style={{whiteSpace: 'nowrap'}}>llm-d.</span>
            </p>

            {/* Links as a clean flex list */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              {links.map((item, i) => {
                const linkStyles: React.CSSProperties = {
                  display: 'block',
                  padding: '24px 28px',
                  border: '1px solid #E0E0E0',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  flex: '1 1 220px',
                  minWidth: '220px',
                }

                const content = (
                  <>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-display)',
                        color: '#151515',
                        marginBottom: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {item.title}
                      {!item.internal && <ExternalLink style={{ width: '13px', height: '13px', color: '#8A8D90' }} />}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6A6E73', lineHeight: '1.5' }}>
                      {item.desc}
                    </div>
                  </>
                )

                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    style={{ flex: '1 1 220px', minWidth: '220px' }}
                  >
                    {item.internal ? (
                      <Link
                        to={item.path}
                        style={linkStyles}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = '#EE0000'
                          e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = '#E0E0E0'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        {content}
                      </Link>
                    ) : (
                      <a
                        href={item.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={linkStyles}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = '#EE0000'
                          e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = '#E0E0E0'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        {content}
                      </a>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cta-layout {
            flex-direction: column !important;
            gap: 24px !important;
          }
          .cta-icon-area {
            flex: 0 0 auto !important;
          }
        }
      `}</style>
    </section>
  )
}
