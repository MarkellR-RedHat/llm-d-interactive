import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const mouseRef = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const count = 150
    const nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = []
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * (w || 1200),
        y: Math.random() * (h || 600),
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 0.8,
      })
    }

    const handleMouse = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const handleLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }
    section.addEventListener('mousemove', handleMouse)
    section.addEventListener('mouseleave', handleLeave)

    const connectDist = 120
    const mouseDist = 140

    const animate = () => {
      ctx.clearRect(0, 0, w, h)

      for (let i = 0; i < count; i++) {
        const n = nodes[i]

        const dx = mouseRef.current.x - n.x
        const dy = mouseRef.current.y - n.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < mouseDist && dist > 1) {
          const force = (mouseDist - dist) / mouseDist * 0.02
          n.vx += dx * force
          n.vy += dy * force
        }

        n.x += n.vx
        n.y += n.vy
        n.vx *= 0.985
        n.vy *= 0.985

        if (n.x < 0) { n.x = 0; n.vx *= -1 }
        if (n.x > w) { n.x = w; n.vx *= -1 }
        if (n.y < 0) { n.y = 0; n.vy *= -1 }
        if (n.y > h) { n.y = h; n.vy *= -1 }

        const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy)
        if (speed < 0.2) {
          n.vx += (Math.random() - 0.5) * 0.08
          n.vy += (Math.random() - 0.5) * 0.08
        }

        for (let j = i + 1; j < count; j++) {
          const m = nodes[j]
          const cdx = n.x - m.x
          const cdy = n.y - m.y
          const cd = Math.sqrt(cdx * cdx + cdy * cdy)
          if (cd < connectDist) {
            const alpha = (1 - cd / connectDist) * 0.18
            ctx.beginPath()
            ctx.moveTo(n.x, n.y)
            ctx.lineTo(m.x, m.y)
            ctx.strokeStyle = `rgba(155, 77, 155, ${alpha})`
            ctx.lineWidth = 0.7
            ctx.stroke()
          }
        }

        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(170, 90, 170, 0.4)'
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      section.removeEventListener('mousemove', handleMouse)
      section.removeEventListener('mouseleave', handleLeave)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '200px',
        paddingBottom: '120px',
        backgroundColor: '#EDEDED',
      }}
    >
      {/* Canvas renders ON TOP of text, like UPenn's particles-js */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />

      {/* Content sits below canvas visually, but is still clickable */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1244px',
          margin: '0 auto',
          padding: '0 30px',
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(40px, 7vw, 80px)',
            fontWeight: 300,
            lineHeight: '110%',
            letterSpacing: '-0.02em',
            color: '#151515',
            paddingBottom: '32px',
            maxWidth: '900px',
          }}
        >
          Learn how to serve large language models with <span style={{whiteSpace: 'nowrap'}}>llm&#x2011;d</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{
            fontSize: '20px',
            lineHeight: '32px',
            color: '#4D4D4D',
            maxWidth: '600px',
            marginBottom: '48px',
          }}
        >
          Interactive guides, tools, and hands-on notebooks for the open source
          Kubernetes-native LLM serving platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}
        >
          <Link
            to="/learn"
            style={{
              display: 'inline-block',
              padding: '14px 24px',
              backgroundColor: '#9b4d9b',
              color: '#fff',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '16px',
              textTransform: 'uppercase' as const,
              borderRadius: '0',
              textDecoration: 'none',
              transition: 'background 0.5s ease',
              letterSpacing: '0.03em',
              position: 'relative',
              zIndex: 20,
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#7f317f')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#9b4d9b')}
          >
            Start Learning
          </Link>
          <Link
            to="/configurator"
            style={{
              display: 'inline-block',
              padding: '14px 24px',
              backgroundColor: 'transparent',
              color: '#151515',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '16px',
              textTransform: 'uppercase' as const,
              borderRadius: '0',
              textDecoration: 'none',
              border: '2px solid #3C3F42',
              transition: 'all 0.3s ease',
              letterSpacing: '0.03em',
              position: 'relative',
              zIndex: 20,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#151515'
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.borderColor = '#151515'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#151515'
              e.currentTarget.style.borderColor = '#3C3F42'
            }}
          >
            Explore Tools
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
