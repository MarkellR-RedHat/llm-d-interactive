import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FlowStep {
  title: string
  detail: string
}

interface InteractiveFlowProps {
  steps: FlowStep[]
  color?: string
}

export default function InteractiveFlow({ steps, color = '#EE0000' }: InteractiveFlowProps) {
  const [activeStep, setActiveStep] = useState<number | null>(null)

  return (
    <div style={{ margin: '32px 0' }}>
      <p style={{ fontSize: '13px', color: '#8A8D90', marginBottom: '20px', fontStyle: 'italic' }}>
        Click any step to learn more about what happens there.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {steps.map((step, i) => (
          <div key={i}>
            <div
              onClick={() => setActiveStep(activeStep === i ? null : i)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                cursor: 'pointer',
                padding: '4px 0',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <motion.div
                  animate={{
                    scale: activeStep === i ? 1.3 : 1,
                    backgroundColor: activeStep === i ? color : '#fff',
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: `2.5px solid ${color}`,
                    backgroundColor: activeStep === i ? color : '#fff',
                    zIndex: 1,
                    marginTop: '3px',
                  }}
                />
                {i < steps.length - 1 && (
                  <div style={{ width: '2px', height: activeStep === i ? '16px' : '40px', backgroundColor: '#E0E0E0', transition: 'height 0.25s' }} />
                )}
              </div>
              <div style={{ flex: 1, paddingBottom: activeStep === i ? '0' : '8px' }}>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: activeStep === i ? 700 : 500,
                    color: activeStep === i ? color : '#151515',
                    lineHeight: '24px',
                    transition: 'color 0.2s',
                  }}
                >
                  <span style={{ color: '#8A8D90', fontWeight: 400, marginRight: '8px', fontSize: '14px' }}>{i + 1}.</span>
                  {step.title}
                </div>
              </div>
            </div>
            <AnimatePresence>
              {activeStep === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden', marginLeft: '32px' }}
                >
                  <div
                    style={{
                      padding: '16px 20px',
                      backgroundColor: '#F7F7F7',
                      fontSize: '15px',
                      lineHeight: '26px',
                      color: '#4D4D4D',
                      marginBottom: '16px',
                      borderLeft: `3px solid ${color}`,
                    }}
                  >
                    {step.detail}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}
