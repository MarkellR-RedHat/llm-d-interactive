import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BookOpen, Compass, FlaskConical } from 'lucide-react'

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
        r: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.3 + 0.1,
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
        if (dist < 180) {
          n.vx += dx * (180 - dist) / 180 * 0.0003
          n.vy += dy * (180 - dist) / 180 * 0.0003
        }
        n.vx *= 0.995
        n.vy *= 0.995

        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(238, 0, 0, ${n.o})`
        ctx.fill()

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j]
          const cd = Math.sqrt((n.x - m.x) ** 2 + (n.y - m.y) ** 2)
          if (cd < 140) {
            ctx.beginPath()
            ctx.moveTo(n.x, n.y)
            ctx.lineTo(m.x, m.y)
            ctx.strokeStyle = `rgba(238, 0, 0, ${(1 - cd / 140) * 0.08})`
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

  const pathways = [
    {
      icon: BookOpen,
      title: 'Learn the fundamentals',
      desc: 'Understand what llm-d is, how disaggregated inference works, and why it matters.',
      path: '/learn',
      label: 'Start learning',
    },
    {
      icon: Compass,
      title: 'Explore the tools',
      desc: 'Try the configurator, visualize routing strategies, and plan your cluster capacity.',
      path: '/configurator',
      label: 'Explore tools',
    },
    {
      icon: FlaskConical,
      title: 'Hands-on tutorials',
      desc: 'Run Jupyter notebooks that walk you through real deployments step by step.',
      path: '/notebooks',
      label: 'Open notebooks',
    },
  ]

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden bg-rh-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-rh-black/40 via-transparent to-rh-black/90" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-rh-red/6 rounded-full blur-[160px]" />
      <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-rh-blue/4 rounded-full blur-[140px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-8 lg:px-12 py-40 w-full">
        <div className="max-w-3xl mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-rh-red text-sm font-medium tracking-wide uppercase mb-6"
          >
            Open source LLM serving platform
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.15] tracking-tight mb-8"
          >
            Learn how to serve
            <br />
            large language models
            <br />
            <span className="text-gradient">with llm-d</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-lg text-rh-gray-300 max-w-xl leading-relaxed"
          >
            This is the interactive learning center for llm-d. Explore how disaggregated
            inference, intelligent routing, and autoscaling work together on Kubernetes.
            Learn at your own pace with guides, interactive tools, and hands-on notebooks.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {pathways.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
            >
              <Link
                to={p.path}
                className="group block p-8 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-300 no-underline h-full"
              >
                <p.icon className="w-6 h-6 text-rh-red mb-5" />
                <h3 className="font-display font-bold text-lg text-white mb-3">
                  {p.title}
                </h3>
                <p className="text-sm text-rh-gray-400 leading-relaxed mb-6">
                  {p.desc}
                </p>
                <span className="text-sm font-medium text-rh-red group-hover:text-rh-red-light transition-colors">
                  {p.label} &rarr;
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 border-2 border-white/15 rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-white/30 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
