import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const nodes: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = []
    for (let i = 0; i < 60; i++) {
      nodes.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2.5 + 1,
        o: Math.random() * 0.25 + 0.08,
      })
    }

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    canvas.addEventListener('mousemove', handleMouse)

    const animate = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > w) n.vx *= -1
        if (n.y < 0 || n.y > h) n.vy *= -1
        const dx = mouseRef.current.x - n.x
        const dy = mouseRef.current.y - n.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200) {
          n.vx += dx * (200 - dist) / 200 * 0.00015
          n.vy += dy * (200 - dist) / 200 * 0.00015
        }
        n.vx *= 0.998
        n.vy *= 0.998
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 200, 205, ${n.o})`
        ctx.fill()
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j]
          const cd = Math.sqrt((n.x - m.x) ** 2 + (n.y - m.y) ** 2)
          if (cd < 180) {
            ctx.beginPath()
            ctx.moveTo(n.x, n.y)
            ctx.lineTo(m.x, m.y)
            ctx.strokeStyle = `rgba(200, 200, 205, ${(1 - cd / 180) * 0.08})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouse)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <section
      style={{
        position: 'relative',
        backgroundColor: '#151515',
        overflow: 'hidden',
        /* Padding accounts for ~100px header + 100px internal padding per UPenn */
        paddingTop: '200px',
        paddingBottom: '100px',
      }}
    >
      {/* Particle canvas - absolute behind everything, like particles-js */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 10,
        }}
      />

      {/* Dark overlay on top of particles */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(21,21,21,0.75)',
          zIndex: 11,
        }}
      />

      {/* Content on top */}
      <div
        style={{
          position: 'relative',
          zIndex: 12,
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
            color: 'rgba(255,255,255,0.75)',
            maxWidth: '600px',
            marginBottom: '48px',
          }}
        >
          Interactive guides, tools, and hands-on notebooks for the open source
          Kubernetes-native LLM serving platform.
        </motion.p>

        {/* CTA buttons - UPenn style: uppercase, no border-radius, bold */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="ctas"
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
              textTransform: 'uppercase',
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
              textTransform: 'uppercase',
              borderRadius: '0',
              textDecoration: 'none',
              border: '2px solid rgba(255,255,255,0.4)',
              transition: 'background 0.5s ease, border-color 0.5s ease',
              letterSpacing: '0.03em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
            }}
          >
            Explore Tools
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
