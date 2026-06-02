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
    for (let i = 0; i < 45; i++) {
      nodes.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 2 + 1,
        o: Math.random() * 0.12 + 0.04,
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
        ctx.fillStyle = `rgba(180, 180, 185, ${n.o})`
        ctx.fill()
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j]
          const cd = Math.sqrt((n.x - m.x) ** 2 + (n.y - m.y) ** 2)
          if (cd < 180) {
            ctx.beginPath()
            ctx.moveTo(n.x, n.y)
            ctx.lineTo(m.x, m.y)
            ctx.strokeStyle = `rgba(180, 180, 185, ${(1 - cd / 180) * 0.05})`
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
    <section className="relative bg-[#f7f7f7] overflow-hidden" style={{ paddingTop: '160px', paddingBottom: '120px' }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="relative z-10" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 40px', textAlign: 'center' }}>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-display"
          style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
            fontWeight: 800,
            color: '#151515',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            marginBottom: '28px',
          }}
        >
          Learn how to serve large language models with llm-d
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{
            fontSize: '1.15rem',
            color: '#4D4D4D',
            lineHeight: 1.8,
            maxWidth: '620px',
            margin: '0 auto 48px',
          }}
        >
          Interactive guides, tools, and hands-on notebooks for the open source
          Kubernetes-native LLM serving platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link
            to="/learn"
            style={{
              display: 'inline-block',
              padding: '14px 36px',
              backgroundColor: '#EE0000',
              color: '#fff',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '0.95rem',
              borderRadius: '6px',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#CC0000')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#EE0000')}
          >
            Start Learning
          </Link>
          <Link
            to="/configurator"
            style={{
              display: 'inline-block',
              padding: '14px 36px',
              backgroundColor: 'transparent',
              color: '#151515',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '0.95rem',
              borderRadius: '6px',
              textDecoration: 'none',
              border: '1.5px solid #D2D2D2',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#8A8D90')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#D2D2D2')}
          >
            Explore Tools
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
