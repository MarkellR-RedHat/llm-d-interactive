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
    for (let i = 0; i < 50; i++) {
      nodes.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.8 + 0.8,
        o: Math.random() * 0.15 + 0.05,
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
          n.vx += dx * (200 - dist) / 200 * 0.0002
          n.vy += dy * (200 - dist) / 200 * 0.0002
        }
        n.vx *= 0.997
        n.vy *= 0.997

        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 200, 200, ${n.o})`
        ctx.fill()

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j]
          const cd = Math.sqrt((n.x - m.x) ** 2 + (n.y - m.y) ** 2)
          if (cd < 160) {
            ctx.beginPath()
            ctx.moveTo(n.x, n.y)
            ctx.lineTo(m.x, m.y)
            ctx.strokeStyle = `rgba(180, 180, 180, ${(1 - cd / 160) * 0.06})`
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
      desc: 'Understand what llm-d is, how disaggregated inference works, and why it matters for serving LLMs at scale.',
      path: '/learn',
      label: 'Start learning',
    },
    {
      icon: Compass,
      title: 'Explore the tools',
      desc: 'Try the deployment configurator, visualize routing strategies, and plan your cluster capacity interactively.',
      path: '/configurator',
      label: 'Explore tools',
    },
    {
      icon: FlaskConical,
      title: 'Hands-on tutorials',
      desc: 'Work through Jupyter notebooks that walk you through real llm-d deployments step by step.',
      path: '/notebooks',
      label: 'Open notebooks',
    },
  ]

  return (
    <section className="relative overflow-hidden bg-rh-gray-50">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="relative z-10 max-w-5xl mx-auto px-8 lg:px-12 pt-48 pb-32">
        <div className="max-w-2xl mb-10">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-rh-red text-sm font-semibold tracking-wide uppercase mb-5"
          >
            Open source LLM serving platform
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[3.5rem] text-rh-black leading-[1.15] tracking-tight"
          >
            llm-d Learning Center
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-lg text-rh-gray-600 max-w-2xl leading-[1.8] mb-24"
        >
          Explore how disaggregated inference, intelligent routing, and autoscaling
          work together on Kubernetes. Learn at your own pace with guides, interactive
          tools, and hands-on notebooks.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          {pathways.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
            >
              <Link
                to={p.path}
                className="group block bg-white rounded-2xl border border-rh-gray-100 hover:border-rh-gray-200 hover:shadow-lg transition-all duration-300 no-underline h-full"
              >
                <div className="p-10">
                  <div className="w-14 h-14 rounded-xl bg-rh-red-50 flex items-center justify-center mb-8">
                    <p.icon className="w-6 h-6 text-rh-red" />
                  </div>

                  <h3 className="font-display font-bold text-xl text-rh-black mb-4 leading-snug">
                    {p.title}
                  </h3>

                  <p className="text-[15px] text-rh-gray-600 leading-[1.75] mb-8">
                    {p.desc}
                  </p>

                  <span className="text-sm font-semibold text-rh-red group-hover:text-rh-red-dark transition-colors">
                    {p.label} &rarr;
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
