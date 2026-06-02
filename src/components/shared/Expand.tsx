import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface ExpandProps {
  label?: string
  children: React.ReactNode
}

export default function Expand({ label = 'Want to know more?', children }: ExpandProps) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ margin: '24px 0', border: '1px solid #E0E0E0' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '18px 24px',
          backgroundColor: open ? '#F0F0F0' : '#FAFAFA',
          border: 'none',
          cursor: 'pointer',
          fontSize: '15px',
          fontWeight: 600,
          fontFamily: 'var(--font-display)',
          color: '#151515',
          transition: 'background-color 0.2s',
          textAlign: 'left',
        }}
      >
        {label}
        <ChevronDown
          style={{
            width: '18px',
            height: '18px',
            color: '#6A6E73',
            transition: 'transform 0.25s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '24px', fontSize: '16px', lineHeight: '28px', color: '#212121' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
