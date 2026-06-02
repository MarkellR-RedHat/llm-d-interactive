import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'

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
    <section style={{ backgroundColor: '#fff', padding: '100px 0', borderTop: '1px solid #E0E0E0' }}>
      <div ref={ref} style={{ maxWidth: '1060px', margin: '0 auto', padding: '0 40px' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '64px' }}
        >
          <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, color: '#151515', marginBottom: '16px' }}>
            Resources
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#4D4D4D', lineHeight: 1.7, maxWidth: '480px' }}>
            Whether you are just starting out or looking for something specific.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
          {links.map((item, i) => {
            const style: React.CSSProperties = {
              display: 'block',
              padding: '32px 28px',
              borderRadius: '10px',
              border: '1px solid #E0E0E0',
              textDecoration: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              height: '100%',
            }
            const content = (
              <>
                <h3 className="font-display" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#151515', marginBottom: '10px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#6A6E73', lineHeight: 1.7, margin: 0 }}>
                  {item.desc}
                </p>
              </>
            )

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                {item.internal ? (
                  <Link
                    to={item.path}
                    style={style}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#B8BBBE'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E0E0E0'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    {content}
                  </Link>
                ) : (
                  <a
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={style}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#B8BBBE'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E0E0E0'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    {content}
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
