import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const mouseRef = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
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

    const count = 90
    const nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = []
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
      })
    }

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const handleLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }
    canvas.addEventListener('mousemove', handleMouse)
    canvas.addEventListener('mouseleave', handleLeave)

    const connectDist = 150
    const mouseDist = 200
    const mouseStrength = 0.0008

    const animate = () => {
      ctx.clearRect(0, 0, w, h)

      for (let i = 0; i < count; i++) {
        const n = nodes[i]

        const dx = mouseRef.current.x - n.x
        const dy = mouseRef.current.y - n.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < mouseDist && dist > 0) {
          const force = (mouseDist - dist) / mouseDist * mouseStrength
          n.vx += dx * force
          n.vy += dy * force
        }

        n.x += n.vx
        n.y += n.vy
        n.vx *= 0.995
        n.vy *= 0.995

        if (n.x < 0) { n.x = 0; n.vx *= -1 }
        if (n.x > w) { n.x = w; n.vx *= -1 }
        if (n.y < 0) { n.y = 0; n.vy *= -1 }
        if (n.y > h) { n.y = h; n.vy *= -1 }

        for (let j = i + 1; j < count; j++) {
          const m = nodes[j]
          const cdx = n.x - m.x
          const cdy = n.y - m.y
          const cd = Math.sqrt(cdx * cdx + cdy * cdy)
          if (cd < connectDist) {
            const alpha = (1 - cd / connectDist) * 0.25
            ctx.beginPath()
            ctx.moveTo(n.x, n.y)
            ctx.lineTo(m.x, m.y)
            ctx.strokeStyle = `rgba(238, 60, 60, ${alpha})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }

        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 100, 100, 0.5)'
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouse)
      canvas.removeEventListener('mouseleave', handleLeave)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '200px',
        paddingBottom: '120px',
        background: 'linear-gradient(135deg, #0C0C0C 0%, #1A0A0A 40%, #1C1010 70%, #111 100%)',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '60%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(238,0,0,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(238,0,0,0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
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
            color: '#ffffff',
            paddingBottom: '32px',
            maxWidth: '900px',
          }}
        >
          Learn how to serve large language models with llm-d
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{
            fontSize: '20px',
            lineHeight: '32px',
            color: 'rgba(255,255,255,0.7)',
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
              backgroundColor: '#EE0000',
              color: '#fff',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '16px',
              textTransform: 'uppercase' as const,
              borderRadius: '0',
              textDecoration: 'none',
              transition: 'background 0.5s ease',
              letterSpacing: '0.03em',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#A30000')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#EE0000')}
          >
            Start Learning
          </Link>
          <Link
            to="/configurator"
            style={{
              display: 'inline-block',
              padding: '14px 24px',
              backgroundColor: 'transparent',
              color: '#fff',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '16px',
              textTransform: 'uppercase' as const,
              borderRadius: '0',
              textDecoration: 'none',
              border: '2px solid rgba(255,255,255,0.3)',
              transition: 'background 0.5s ease, border-color 0.5s ease',
              letterSpacing: '0.03em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
            }}
          >
            Explore Tools
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
