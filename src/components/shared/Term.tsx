import { useState, useRef, useEffect } from 'react'

interface TermProps {
  children: React.ReactNode
  definition: string
}

export default function Term({ children, definition }: TermProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const popRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (
        ref.current && !ref.current.contains(e.target as Node) &&
        popRef.current && !popRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline' }}>
      <span
        onClick={() => setOpen(!open)}
        style={{
          borderBottom: '1.5px dotted #EE0000',
          cursor: 'pointer',
          color: 'inherit',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#EE0000')}
        onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}
      >
        {children}
      </span>
      {open && (
        <div
          ref={popRef}
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 10px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '320px',
            padding: '20px 22px',
            backgroundColor: '#151515',
            color: '#fff',
            fontSize: '14px',
            lineHeight: '22px',
            zIndex: 1000,
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#EE0000', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Definition
          </div>
          {definition}
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: '12px',
              height: '12px',
              backgroundColor: '#151515',
            }}
          />
        </div>
      )}
    </span>
  )
}
