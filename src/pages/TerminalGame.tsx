import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageTransition from '../components/shared/PageTransition'
import {
  MODEL_OPTIONS,
  MISSIONS,
  GLOBAL_COMMANDS,
  COMPLETION_MESSAGE,
  getModelDependentOutput,
  getModelDependentDelay,
  type ModelInfo,
} from '../data/terminal-game-data'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PURPLE = '#9b4d9b'
const TERMINAL_BG = '#0D0D0D'
const TERMINAL_BORDER = '#333'
const TEXT_DEFAULT = '#D2D2D2'
const TEXT_SUCCESS = '#4AF626'
const TEXT_ERROR = '#FF6B6B'
const TEXT_SYSTEM = PURPLE
const PROMPT_COLOR = TEXT_SUCCESS
const SIDEBAR_WIDTH = 220
const TERMINAL_HEIGHT = 500
const HINT_DELAY_MS = 15000
const FULL_HINT_DELAY_MS = 30000
const LINE_DELAY_MS = 50

const MODEL_FAMILIES = [...new Set(MODEL_OPTIONS.map((m) => m.family))]

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface HistoryLine {
  type: 'input' | 'output' | 'system' | 'error' | 'success'
  text: string
}

/* ------------------------------------------------------------------ */
/*  Color helpers                                                      */
/* ------------------------------------------------------------------ */

function lineColor(type: HistoryLine['type']): string {
  switch (type) {
    case 'input':
      return PROMPT_COLOR
    case 'output':
      return TEXT_DEFAULT
    case 'system':
      return TEXT_SYSTEM
    case 'error':
      return TEXT_ERROR
    case 'success':
      return TEXT_SUCCESS
  }
}

/* ------------------------------------------------------------------ */
/*  Welcome message builder                                            */
/* ------------------------------------------------------------------ */

function buildWelcome(): HistoryLine[] {
  const mission = MISSIONS[0]
  const step = mission.steps[0]
  return [
    { type: 'system', text: 'Welcome to the llm-d Deployment Simulator!' },
    { type: 'output', text: '' },
    { type: 'output', text: 'You will deploy llm-d from scratch on a simulated OpenShift cluster.' },
    { type: 'output', text: 'Type commands just like you would in a real terminal.' },
    { type: 'output', text: '' },
    { type: 'output', text: "Type 'help' at any time to see available commands." },
    { type: 'output', text: '' },
    { type: 'system', text: `Mission 1: ${mission.title}` },
    { type: 'system', text: String.fromCharCode(9472).repeat(36) },
    { type: 'output', text: mission.description },
    { type: 'output', text: '' },
    { type: 'output', text: `Type: ${step.hint.replace('Try: ', '')}` },
  ]
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function TerminalGame() {
  /* ---- state ---- */
  const [history, setHistory] = useState<HistoryLine[]>(buildWelcome)
  const [input, setInput] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>('Qwen/Qwen3-0.6B')
  const [currentMission, setCurrentMission] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedMissions, setCompletedMissions] = useState<Set<number>>(new Set())
  const [showModelPanel, setShowModelPanel] = useState(false)
  const [showExplanation, setShowExplanation] = useState(true)
  const [lastExplanation, setLastExplanation] = useState('')
  const [hintTimerRef, setHintTimerRef] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [fullHintTimerRef, setFullHintTimerRef] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showFullHint, setShowFullHint] = useState(false)
  const [allComplete, setAllComplete] = useState(false)
  const [familyFilter, setFamilyFilter] = useState<string>('All')
  const [pendingModel, setPendingModel] = useState<string>('Qwen/Qwen3-0.6B')

  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /* ---- auto-scroll ---- */
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [history])

  /* ---- focus input on mount ---- */
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  /* ---- hint timers ---- */
  const resetHintTimers = useCallback(() => {
    setShowHint(false)
    setShowFullHint(false)
    if (hintTimerRef) clearTimeout(hintTimerRef)
    if (fullHintTimerRef) clearTimeout(fullHintTimerRef)

    if (allComplete) return

    const t1 = setTimeout(() => setShowHint(true), HINT_DELAY_MS)
    const t2 = setTimeout(() => setShowFullHint(true), FULL_HINT_DELAY_MS)
    setHintTimerRef(t1)
    setFullHintTimerRef(t2)
  }, [hintTimerRef, fullHintTimerRef, allComplete])

  /* ---- cleanup timers on unmount ---- */
  useEffect(() => {
    return () => {
      if (hintTimerRef) clearTimeout(hintTimerRef)
      if (fullHintTimerRef) clearTimeout(fullHintTimerRef)
    }
  }, [hintTimerRef, fullHintTimerRef])

  /* ---- show model panel when mission 4 starts ---- */
  useEffect(() => {
    if (currentMission === 3 && !allComplete) {
      setShowModelPanel(true)
    }
  }, [currentMission, allComplete])

  /* ---- get current mission & step ---- */
  const mission = MISSIONS[currentMission] ?? MISSIONS[MISSIONS.length - 1]
  const step = mission?.steps[currentStep] ?? null

  /* ---- typing effect: add lines one at a time ---- */
  const addLinesWithDelay = useCallback(
    (
      lines: HistoryLine[],
      onComplete?: () => void
    ) => {
      if (lines.length === 0) {
        onComplete?.()
        return
      }
      let i = 0
      const interval = setInterval(() => {
        if (i < lines.length && lines[i]) {
          setHistory((prev) => [...prev, lines[i]])
          i++
        }
        if (i >= lines.length) {
          clearInterval(interval)
          onComplete?.()
        }
      }, LINE_DELAY_MS)
    },
    []
  )

  /* ---- advance to next step or mission ---- */
  const advanceStep = useCallback(() => {
    const nextStep = currentStep + 1
    if (nextStep < mission.steps.length) {
      setCurrentStep(nextStep)
      const ns = mission.steps[nextStep]
      setHistory((prev) => [
        ...prev,
        { type: 'output', text: '' },
        { type: 'output', text: `Type: ${ns.hint.replace('Try: ', '')}` },
      ])
    } else {
      // Mission complete
      const newCompleted = new Set(completedMissions)
      newCompleted.add(currentMission)
      setCompletedMissions(newCompleted)

      const nextMission = currentMission + 1
      if (nextMission < MISSIONS.length) {
        setCurrentMission(nextMission)
        setCurrentStep(0)
        const nm = MISSIONS[nextMission]
        const ns = nm.steps[0]
        setHistory((prev) => [
          ...prev,
          { type: 'output', text: '' },
          { type: 'success', text: `Mission ${currentMission + 1} complete.` },
          { type: 'output', text: '' },
          { type: 'system', text: `Mission ${nextMission + 1}: ${nm.title}` },
          { type: 'system', text: String.fromCharCode(9472).repeat(36) },
          { type: 'output', text: nm.description },
          { type: 'output', text: '' },
          { type: 'output', text: `Type: ${ns.hint.replace('Try: ', '')}` },
        ])
      } else {
        // All missions complete
        setAllComplete(true)
        const completionLines: HistoryLine[] = COMPLETION_MESSAGE.map((line) => ({
          type: 'success' as const,
          text: line,
        }))
        addLinesWithDelay(completionLines)
      }
    }
  }, [currentStep, currentMission, mission, completedMissions, addLinesWithDelay])

  /* ---- process a command ---- */
  const processCommand = useCallback(
    (cmd: string) => {
      try {
      const trimmed = cmd.trim()
      if (!trimmed) return
      if (isProcessing) return

      // Add to command history
      setCommandHistory((prev) => [...prev, trimmed])
      setHistoryIndex(-1)
      resetHintTimers()

      // Add input line
      setHistory((prev) => [...prev, { type: 'input', text: `user@llm-d-demo $ ${trimmed}` }])

      // Check for 'clear'
      if (trimmed === 'clear') {
        setHistory([])
        return
      }

      // Check global commands
      const globalMatch = GLOBAL_COMMANDS[trimmed]
      if (globalMatch) {
        const lines: HistoryLine[] = globalMatch.output.map((line) => ({
          type: 'output' as const,
          text: line,
        }))
        addLinesWithDelay(lines)
        if (globalMatch.explanation) {
          setLastExplanation(globalMatch.explanation)
        }
        return
      }

      // Check if it matches the current step
      if (step && !allComplete) {
        const matched = step.acceptedCommands.some((ac) => {
          const normalizedAc = ac.replace(/<MODEL>/g, selectedModel)
          // Exact match
          if (trimmed === normalizedAc) return true
          // Match if user typed the main command (at least the first 2 words)
          const trimmedWords = trimmed.split(/\s+/)
          const acWords = normalizedAc.split(/\s+/)
          if (trimmedWords.length >= 2 && acWords.length >= 2 && trimmedWords[0] === acWords[0] && trimmedWords[1] === acWords[1]) return true
          // Match the core command (first word match + at least 60% of the full command typed)
          if (trimmedWords[0] === acWords[0] && trimmed.length > normalizedAc.length * 0.6) return true
          return false
        })

        if (matched) {
          setIsProcessing(true)

          // Get output (model-dependent or standard)
          let outputLines: string[]
          if (step.isModelDependent) {
            const modelOutput = getModelDependentOutput(step.id, selectedModel)
            outputLines = modelOutput ?? step.output
          } else {
            outputLines = step.output
          }

          // Get delay
          let delay = step.simulatedDelay ?? 0
          if (step.isModelDependent) {
            const modelDelay = getModelDependentDelay(step.id, selectedModel)
            if (modelDelay > 0) delay = modelDelay
          }

          const histLines: HistoryLine[] = outputLines.map((line) => ({
            type: 'output' as const,
            text: line,
          }))

          if (delay > 0) {
            // Show processing indicator
            setHistory((prev) => [
              ...prev,
              { type: 'system', text: 'Processing...' },
            ])

            setTimeout(() => {
              // Remove processing indicator
              setHistory((prev) => prev.filter((l) => l.text !== 'Processing...'))
              addLinesWithDelay(histLines, () => {
                setIsProcessing(false)
                setLastExplanation(step.explanation)
                advanceStep()
              })
            }, Math.min(delay, 3000)) // cap visual delay at 3s for UX
          } else {
            addLinesWithDelay(histLines, () => {
              setIsProcessing(false)
              setLastExplanation(step.explanation)
              advanceStep()
            })
          }
          return
        }
      }

      // No match
      setHistory((prev) => [
        ...prev,
        { type: 'error', text: "Command not recognized. Type 'help' for available commands." },
      ])
      } catch (err) {
        console.error('Terminal command error:', err)
        setHistory((prev) => [
          ...prev,
          { type: 'error', text: 'An error occurred processing that command. Try again.' },
        ])
        setIsProcessing(false)
      }
    },
    [isProcessing, step, allComplete, selectedModel, addLinesWithDelay, advanceStep, resetHintTimers]
  )

  /* ---- keyboard handler ---- */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        processCommand(input)
        setInput('')
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (commandHistory.length === 0) return
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (historyIndex === -1) return
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setInput('')
        } else {
          setHistoryIndex(newIndex)
          setInput(commandHistory[newIndex])
        }
      }
    },
    [input, commandHistory, historyIndex, processCommand]
  )

  /* ---- click terminal to focus ---- */
  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  /* ---- reset hint timers on typing ---- */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value)
      resetHintTimers()
    },
    [resetHintTimers]
  )

  /* ---- model panel confirm ---- */
  const confirmModel = useCallback(() => {
    setSelectedModel(pendingModel)
    setHistory((prev) => [
      ...prev,
      { type: 'success', text: `Model selected: ${pendingModel}` },
    ])
    setShowModelPanel(false)
  }, [pendingModel])

  /* ---- filtered models ---- */
  const filteredModels =
    familyFilter === 'All'
      ? MODEL_OPTIONS
      : MODEL_OPTIONS.filter((m) => m.family === familyFilter)

  /* ---- current hint text ---- */
  const currentHintText = step ? step.hint.replace('Try: ', '') : ''

  /* ---- sidebar mission list ---- */
  function renderSidebar() {
    return (
      <div
        style={{
          width: SIDEBAR_WIDTH,
          minWidth: SIDEBAR_WIDTH,
          backgroundColor: '#1A1A1A',
          borderRight: '1px solid #2A2A2A',
          padding: '16px 0',
          overflowY: 'auto',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '0 16px 12px', fontFamily: 'var(--font-body)', fontSize: '11px', color: '#888', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Missions
        </div>
        {MISSIONS.map((m, idx) => {
          const isActive = currentMission === idx && !allComplete
          const isCompleted = completedMissions.has(idx) || allComplete
          const isFuture = idx > currentMission && !allComplete
          const stepsInMission = m.steps.length
          const stepsCompleted = isCompleted
            ? stepsInMission
            : isActive
              ? currentStep
              : 0

          return (
            <div
              key={m.id}
              style={{
                padding: '10px 16px',
                borderLeft: isActive ? `3px solid ${PURPLE}` : '3px solid transparent',
                backgroundColor: isActive ? 'rgba(155, 77, 155, 0.08)' : 'transparent',
                opacity: isFuture ? 0.45 : 1,
                cursor: 'default',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isCompleted ? (
                  <span style={{ color: TEXT_SUCCESS, fontSize: '14px', fontWeight: 700 }}>
                    {'✓'}
                  </span>
                ) : isFuture ? (
                  <span style={{ color: '#555', fontSize: '12px' }}>
                    {'●'}
                  </span>
                ) : (
                  <span style={{ color: PURPLE, fontSize: '14px', fontWeight: 700 }}>
                    {idx + 1}
                  </span>
                )}
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 400,
                    color: isCompleted ? TEXT_SUCCESS : isActive ? '#fff' : '#888',
                    lineHeight: '18px',
                  }}
                >
                  {m.title}
                </span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: '#666',
                  marginTop: '4px',
                  marginLeft: '22px',
                }}
              >
                {stepsCompleted}/{stepsInMission} steps
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  /* ---- terminal component ---- */
  function renderTerminal() {
    return (
      <div
        onClick={focusInput}
        style={{
          backgroundColor: TERMINAL_BG,
          border: `1px solid ${TERMINAL_BORDER}`,
          borderRadius: '8px',
          height: `${TERMINAL_HEIGHT}px`,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: '"Red Hat Mono", "Fira Code", "Consolas", monospace',
          fontSize: '13px',
          lineHeight: '20px',
          overflow: 'hidden',
          cursor: 'text',
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            backgroundColor: '#1A1A1A',
            borderBottom: `1px solid ${TERMINAL_BORDER}`,
            flexShrink: 0,
          }}
        >
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FF5F57' }} />
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FEBC2E' }} />
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#28C840' }} />
          <span
            style={{
              marginLeft: '8px',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: '#888',
            }}
          >
            llm-d-demo / terminal
          </span>
        </div>

        {/* Scrollable output */}
        <div
          ref={outputRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#444 transparent',
          }}
        >
          {history.map((line, idx) => (
            <div
              key={idx}
              style={{
                color: lineColor(line.type),
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                minHeight: line.text === '' ? '20px' : undefined,
              }}
            >
              {line.text}
            </div>
          ))}
          {isProcessing && (
            <div style={{ color: TEXT_SYSTEM }}>
              <ProcessingIndicator />
            </div>
          )}
        </div>

        {/* Input line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            borderTop: `1px solid ${TERMINAL_BORDER}`,
            backgroundColor: '#0A0A0A',
            flexShrink: 0,
          }}
        >
          <span style={{ color: PROMPT_COLOR, marginRight: '8px', fontWeight: 700, userSelect: 'none' }}>
            user@llm-d-demo $
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: PROMPT_COLOR,
              fontFamily: '"Red Hat Mono", "Fira Code", "Consolas", monospace',
              fontSize: '13px',
              lineHeight: '20px',
              caretColor: PROMPT_COLOR,
              padding: 0,
            }}
          />
        </div>
      </div>
    )
  }

  /* ---- model selection panel ---- */
  function renderModelPanel() {
    if (!showModelPanel) return null

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            backgroundColor: '#1A1A1A',
            border: `1px solid ${TERMINAL_BORDER}`,
            borderRadius: '8px',
            marginBottom: '16px',
            overflow: 'hidden',
          }}
        >
          {/* Panel header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: `1px solid ${TERMINAL_BORDER}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                Select a Model
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#888' }}>
                ({MODEL_OPTIONS.length} models available)
              </span>
            </div>
            <button
              onClick={() => setShowModelPanel(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px 8px',
                lineHeight: 1,
              }}
            >
              {'✕'}
            </button>
          </div>

          {/* Family filter tabs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              padding: '12px 16px',
              borderBottom: `1px solid ${TERMINAL_BORDER}`,
            }}
          >
            <FilterTab label="All" active={familyFilter === 'All'} onClick={() => setFamilyFilter('All')} />
            {MODEL_FAMILIES.map((fam) => (
              <FilterTab key={fam} label={fam} active={familyFilter === fam} onClick={() => setFamilyFilter(fam)} />
            ))}
          </div>

          {/* Model table */}
          <div style={{ maxHeight: '320px', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#444 transparent' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${TERMINAL_BORDER}`, color: '#888', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', fontWeight: 600 }}>Model</th>
                  <th style={{ padding: '8px 8px', fontWeight: 600 }}>Params</th>
                  <th style={{ padding: '8px 8px', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '8px 8px', fontWeight: 600 }}>VRAM FP16</th>
                  <th style={{ padding: '8px 8px', fontWeight: 600 }}>VRAM FP8</th>
                  <th style={{ padding: '8px 8px', fontWeight: 600 }}>TP</th>
                  <th style={{ padding: '8px 8px', fontWeight: 600 }}>GPU</th>
                  <th style={{ padding: '8px 8px', fontWeight: 600 }}>Gated</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.map((model) => {
                  const isSelected = pendingModel === model.id
                  return (
                    <tr
                      key={model.id}
                      onClick={() => setPendingModel(model.id)}
                      style={{
                        borderBottom: '1px solid #222',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'rgba(155, 77, 155, 0.15)' : 'transparent',
                        outline: isSelected ? `1px solid ${PURPLE}` : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }
                      }}
                    >
                      <td style={{ padding: '8px 12px', color: isSelected ? '#fff' : TEXT_DEFAULT, fontWeight: isSelected ? 600 : 400 }}>
                        <div>{model.name}</div>
                        <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>{model.family}</div>
                      </td>
                      <td style={{ padding: '8px 8px', color: TEXT_DEFAULT }}>{model.params}</td>
                      <td style={{ padding: '8px 8px' }}>
                        <TypeBadge type={model.type} />
                      </td>
                      <td style={{ padding: '8px 8px', color: TEXT_DEFAULT }}>{model.vramFP16}</td>
                      <td style={{ padding: '8px 8px', color: TEXT_DEFAULT }}>{model.vramFP8}</td>
                      <td style={{ padding: '8px 8px', color: TEXT_DEFAULT }}>{model.tensorParallelism}</td>
                      <td style={{ padding: '8px 8px', color: TEXT_DEFAULT, fontSize: '11px', maxWidth: '140px' }}>{model.recommendedGPU}</td>
                      <td style={{ padding: '8px 8px' }}>
                        {model.gated ? (
                          <span style={{ color: '#FEBC2E', fontSize: '11px' }}>Gated</span>
                        ) : (
                          <span style={{ color: TEXT_SUCCESS, fontSize: '11px' }}>Open</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Selected model detail + confirm */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderTop: `1px solid ${TERMINAL_BORDER}`,
              backgroundColor: '#151515',
            }}
          >
            <div>
              <span style={{ color: '#888', fontFamily: 'var(--font-body)', fontSize: '12px' }}>Selected: </span>
              <span style={{ color: '#fff', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600 }}>
                {MODEL_OPTIONS.find((m) => m.id === pendingModel)?.name ?? pendingModel}
              </span>
              <span style={{ color: '#666', fontFamily: 'var(--font-body)', fontSize: '11px', marginLeft: '8px' }}>
                {MODEL_OPTIONS.find((m) => m.id === pendingModel)?.description ?? ''}
              </span>
            </div>
            <button
              onClick={confirmModel}
              style={{
                backgroundColor: PURPLE,
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 20px',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Use this model
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  /* ---- hint bar ---- */
  function renderHintBar() {
    if (allComplete) return null
    if (!showHint && !showFullHint) return null

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            marginTop: '8px',
            padding: '8px 12px',
            backgroundColor: 'rgba(155, 77, 155, 0.08)',
            border: `1px solid rgba(155, 77, 155, 0.2)`,
            borderRadius: '6px',
            fontFamily: '"Red Hat Mono", monospace',
            fontSize: '12px',
            color: '#B0B0B0',
          }}
        >
          {showFullHint ? (
            <span>
              Hint: Type{' '}
              <code
                style={{
                  backgroundColor: 'rgba(155, 77, 155, 0.15)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  color: PURPLE,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setInput(currentHintText)
                  inputRef.current?.focus()
                }}
              >
                {currentHintText}
              </code>
            </span>
          ) : (
            <span>
              Hint: Try typing{' '}
              <code
                style={{
                  backgroundColor: 'rgba(155, 77, 155, 0.15)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  color: PURPLE,
                }}
              >
                {currentHintText.split(' ').slice(0, 3).join(' ')}...
              </code>
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    )
  }

  /* ---- explanation panel ---- */
  function renderExplanationPanel() {
    return (
      <div
        style={{
          marginTop: '16px',
          backgroundColor: '#1A1A1A',
          border: `1px solid ${TERMINAL_BORDER}`,
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        {/* Toggle header */}
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#fff',
          }}
        >
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600 }}>
            {allComplete ? 'Deployment Complete' : `Mission ${currentMission + 1}: ${mission.title}`}
          </span>
          <span style={{ color: '#888', fontSize: '12px', fontFamily: 'var(--font-body)' }}>
            {showExplanation ? 'Hide' : 'Show'} details
          </span>
        </button>

        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${TERMINAL_BORDER}`, paddingTop: '12px' }}>
                {/* Mission description */}
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#B0B0B0', lineHeight: '20px', marginBottom: '12px' }}>
                  {mission.description}
                </p>

                {/* Current step instruction */}
                {step && !allComplete && (
                  <div
                    style={{
                      backgroundColor: 'rgba(155, 77, 155, 0.08)',
                      border: `1px solid rgba(155, 77, 155, 0.2)`,
                      borderRadius: '6px',
                      padding: '10px 14px',
                      marginBottom: '12px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: PURPLE, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                      Step {currentStep + 1} of {mission.steps.length}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#fff', lineHeight: '20px' }}>
                      {step.instruction}
                    </div>
                  </div>
                )}

                {/* Last explanation */}
                {lastExplanation && (
                  <div
                    style={{
                      backgroundColor: '#222',
                      borderRadius: '6px',
                      padding: '10px 14px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                      What does this do?
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: TEXT_DEFAULT, lineHeight: '20px' }}>
                      {lastExplanation}
                    </div>
                  </div>
                )}

                {/* Completion links */}
                {allComplete && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                    <CompletionLink to="/architecture" label="Architecture Deep Dive" />
                    <CompletionLink to="/routing" label="Routing Simulation" />
                    <CompletionLink to="/capacity" label="Capacity Planner" />
                    <CompletionLink to="/configurator" label="Deployment Configurator" />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  /* ---- celebration overlay ---- */
  function renderCelebration() {
    if (!allComplete) return null
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          borderRadius: '8px',
          boxShadow: `0 0 40px rgba(155, 77, 155, 0.3), inset 0 0 40px rgba(155, 77, 155, 0.05)`,
        }}
      />
    )
  }

  /* ---- main render ---- */
  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', backgroundColor: '#111' }}>
        {/* Header */}
        <div style={{ backgroundColor: '#151515', padding: '48px 24px 32px', marginBottom: '0' }}>
          <div style={{ maxWidth: '1244px', margin: '0 auto' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: PURPLE, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Interactive
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 700, color: '#fff', lineHeight: '48px', marginBottom: '12px' }}>
              Deployment Simulator
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '18px', color: '#B0B0B0', lineHeight: '28px' }}>
              Learn to deploy llm{'‑'}d by typing real commands in a simulated terminal. No cluster required.
            </p>
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth: '1244px', margin: '0 auto', padding: '0 24px 64px' }}>
          <div
            style={{
              display: 'flex',
              gap: '0',
              marginTop: '0',
            }}
          >
            {/* Sidebar: desktop only */}
            <div
              style={{
                display: 'none',
              }}
              className="terminal-sidebar"
            >
              {renderSidebar()}
            </div>

            {/* Main area */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Model panel */}
              {renderModelPanel()}

              {/* Toggle model panel button when in mission 4+ */}
              {currentMission >= 3 && !showModelPanel && !allComplete && (
                <div style={{ marginBottom: '12px' }}>
                  <button
                    onClick={() => setShowModelPanel(true)}
                    style={{
                      backgroundColor: 'transparent',
                      border: `1px solid ${TERMINAL_BORDER}`,
                      borderRadius: '6px',
                      padding: '6px 12px',
                      color: '#888',
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Change model (current: {MODEL_OPTIONS.find((m) => m.id === selectedModel)?.name ?? selectedModel})
                  </button>
                </div>
              )}

              {/* Terminal */}
              <div style={{ position: 'relative' }}>
                {renderTerminal()}
                {renderCelebration()}
              </div>

              {/* Hint bar */}
              {renderHintBar()}

              {/* Explanation panel */}
              {renderExplanationPanel()}
            </div>
          </div>
        </div>
      </div>

      {/* Inject responsive CSS for sidebar */}
      <style>{`
        @media (min-width: 900px) {
          .terminal-sidebar {
            display: block !important;
          }
        }
      `}</style>
    </PageTransition>
  )
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

function ProcessingIndicator() {
  const [dots, setDots] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d + 1) % 4)
    }, 400)
    return () => clearInterval(interval)
  }, [])

  return <span>Processing{'.'.repeat(dots)}</span>
}

function FilterTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 12px',
        borderRadius: '4px',
        border: active ? `1px solid ${PURPLE}` : '1px solid #333',
        backgroundColor: active ? 'rgba(155, 77, 155, 0.15)' : 'transparent',
        color: active ? PURPLE : '#888',
        fontFamily: 'var(--font-body)',
        fontSize: '12px',
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

function TypeBadge({ type }: { type: ModelInfo['type'] }) {
  const colors: Record<ModelInfo['type'], { bg: string; text: string }> = {
    dense: { bg: 'rgba(42, 157, 143, 0.15)', text: '#2A9D8F' },
    MoE: { bg: 'rgba(230, 157, 68, 0.15)', text: '#E69D44' },
    quantized: { bg: 'rgba(100, 149, 237, 0.15)', text: '#6495ED' },
  }
  const c = colors[type]
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '3px',
        backgroundColor: c.bg,
        color: c.text,
        fontSize: '11px',
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
      }}
    >
      {type}
    </span>
  )
}

function CompletionLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      style={{
        display: 'inline-block',
        padding: '8px 16px',
        borderRadius: '6px',
        backgroundColor: 'rgba(155, 77, 155, 0.1)',
        border: `1px solid rgba(155, 77, 155, 0.3)`,
        color: PURPLE,
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
        fontWeight: 600,
        textDecoration: 'none',
      }}
    >
      {label}
    </Link>
  )
}
