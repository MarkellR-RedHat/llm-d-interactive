import { useState, useEffect, useRef, useCallback } from 'react'
import PageTransition from '../components/shared/PageTransition'
import {
  createInitialState,
  generateRequest,
  simulateTick,
  killReplica,

  resetRequestCounter,
} from '../data/routing-simulation'
import type { SimState, RoutingPolicy } from '../data/routing-simulation'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PURPLE = '#9b4d9b'
const PURPLE_DARK = '#7f317f'
const PURPLE_LIGHT = '#f3e8f3'
const BLACK = '#151515'
const GRAY_600 = '#4D4D4D'
const GRAY_400 = '#8A8D90'
const GRAY_300 = '#B8BBBE'
const GRAY_200 = '#D2D2D2'
const GRAY_100 = '#E0E0E0'
const GRAY_50 = '#F0F0F0'

const POLICIES: { id: RoutingPolicy; label: string }[] = [
  { id: 'round-robin', label: 'Round Robin' },
  { id: 'prefix-cache', label: 'Prefix Cache' },
  { id: 'load-aware', label: 'Load Aware' },
  { id: 'predicted-latency', label: 'Predicted Latency' },
]

const POLICY_EXPLANATIONS: Record<RoutingPolicy, { title: string; body: string }> = {
  'round-robin': {
    title: 'Round Robin',
    body: 'Distributes requests evenly across all replicas in order, ignoring load and cache state. Simple but often suboptimal because it cannot take advantage of prefix cache locality or avoid overloaded replicas.',
  },
  'prefix-cache': {
    title: 'Prefix-Cache Aware',
    body: 'Routes requests to replicas that already have the relevant conversation prefix cached in their KV cache. This avoids redundant prefill computation and dramatically reduces time-to-first-token. Watch the cache hit rate increase compared to round-robin.',
  },
  'load-aware': {
    title: 'Load-Aware',
    body: 'Scores each replica based on queue depth, active requests, and KV cache utilization, then routes to the least loaded one. Prevents hotspots where one replica is overwhelmed while others are idle.',
  },
  'predicted-latency': {
    title: 'Predicted Latency',
    body: 'Estimates how long each request would take on each replica (considering cache state, queue depth, and request size) and routes to the replica predicted to serve it fastest. Provides the best latency characteristics for mixed workloads.',
  },
}

/* ------------------------------------------------------------------ */
/*  Animated request dot (UI-only tracking)                            */
/* ------------------------------------------------------------------ */

interface AnimDot {
  id: string
  targetReplica: number
  cacheHit: boolean
  /** 0..1 progress across the visualization area */
  progress: number
  /** birth time (performance.now) for animation */
  born: number
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function PolicyButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '8px 18px',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '13px',
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        borderRadius: '20px',
        border: `2px solid ${PURPLE}`,
        backgroundColor: active ? PURPLE : hovered ? PURPLE_LIGHT : '#fff',
        color: active ? '#fff' : PURPLE,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

function ActionButton({
  label,
  onClick,
  color,
  active,
}: {
  label: string
  onClick: () => void
  color: string
  active?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const filled = active || hovered
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '8px 16px',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '12px',
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        borderRadius: '4px',
        border: `2px solid ${color}`,
        backgroundColor: filled ? color : '#fff',
        color: filled ? '#fff' : color,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

function SpeedButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px',
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        fontSize: '12px',
        borderRadius: '4px',
        border: `1px solid ${active ? PURPLE : GRAY_300}`,
        backgroundColor: active ? PURPLE_LIGHT : '#fff',
        color: active ? PURPLE_DARK : GRAY_400,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {label}
    </button>
  )
}

function StatCard({
  label,
  value,
  unit,
  description,
}: {
  label: string
  value: string
  unit: string
  description?: string
}) {
  return (
    <div
      style={{
        flex: '1 1 200px',
        padding: '24px 20px',
        backgroundColor: PURPLE_LIGHT,
        borderRadius: '4px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '28px',
          color: PURPLE,
          marginBottom: '2px',
          transition: 'all 0.3s ease',
        }}
      >
        {value}
        <span style={{ fontSize: '14px', fontWeight: 600, marginLeft: '4px' }}>
          {unit}
        </span>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '12px',
          fontWeight: 700,
          color: GRAY_600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </div>
      {description && (
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            lineHeight: '16px',
            color: GRAY_400,
            marginTop: '8px',
          }}
        >
          {description}
        </div>
      )}
    </div>
  )
}

function ReplicaNodeCard({
  name,
  active,
  queueDepth,
  activeRequests,
  kvCacheUtil,
}: {
  name: string
  active: boolean
  queueDepth: number
  activeRequests: number
  kvCacheUtil: number
}) {
  const bgColor = active ? BLACK : '#666'
  const fillPct = Math.round(kvCacheUtil * 100)
  return (
    <div
      style={{
        width: '100%',
        padding: '12px 10px',
        backgroundColor: bgColor,
        borderRadius: '6px',
        position: 'relative',
        opacity: active ? 1 : 0.5,
        transition: 'all 0.3s ease',
      }}
    >
      {!active && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '28px',
            fontWeight: 900,
            color: '#ff4444',
            fontFamily: 'var(--font-display)',
            opacity: 0.8,
            pointerEvents: 'none',
          }}
        >
          X
        </div>
      )}
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '11px',
          color: '#fff',
          marginBottom: '8px',
          textAlign: 'center',
          letterSpacing: '0.02em',
        }}
      >
        {name}
      </div>
      {/* KV Cache bar */}
      <div
        style={{
          height: '6px',
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '6px',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${fillPct}%`,
            backgroundColor:
              fillPct > 80
                ? '#ff6b6b'
                : fillPct > 50
                  ? '#ffa94d'
                  : '#51cf66',
            borderRadius: '3px',
            transition: 'width 0.3s ease, background-color 0.3s ease',
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.6)',
        }}
      >
        <span>Q:{queueDepth}</span>
        <span>KV:{fillPct}%</span>
      </div>
      <div
        style={{
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.5)',
          marginTop: '4px',
        }}
      >
        Active: {activeRequests}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function RoutingVisualizer() {
  /* ---- simulation state ---- */
  const [simState, setSimState] = useState<SimState>(() =>
    createInitialState(4, 'round-robin'),
  )
  const simRef = useRef(simState)
  simRef.current = simState

  const [policy, setPolicy] = useState<RoutingPolicy>('round-robin')
  const [burst, setBurst] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [running, setRunning] = useState(true)

  /* ---- animation dots ---- */
  const [dots, setDots] = useState<AnimDot[]>([])
  const animFrameRef = useRef(0)
  const intervalRef = useRef(0)
  const dotIdCounter = useRef(0)

  /* ---- reset handler ---- */
  const handleReset = useCallback(() => {
    resetRequestCounter()
    const fresh = createInitialState(4, policy)
    setSimState(fresh)
    simRef.current = fresh
    setDots([])
    setBurst(false)
    setRunning(true)
  }, [policy])

  /* ---- policy switch ---- */
  const handlePolicyChange = useCallback((p: RoutingPolicy) => {
    setPolicy(p)
    // Reset with the new policy so routing behavior changes immediately
    resetRequestCounter()
    const fresh = createInitialState(4, p)
    setSimState(fresh)
    simRef.current = fresh
    setDots([])
  }, [])

  /* ---- kill a random active node ---- */
  const handleKill = useCallback(() => {
    setSimState((prev) => {
      const activeReplicas = prev.replicas.filter((r) => r.active)
      if (activeReplicas.length <= 1) return prev // keep at least one
      const victim =
        activeReplicas[Math.floor(Math.random() * activeReplicas.length)]
      const next = killReplica(prev, victim.id)
      simRef.current = next
      return next
    })
  }, [])

  /* ---- simulation tick interval ---- */
  useEffect(() => {
    if (!running) return

    const tickMs = Math.round(100 / speed)

    const id = window.setInterval(() => {
      const state = simRef.current

      // Generate new requests for this tick
      const newRequests = generateRequest(state.tick, burst)

      // Create animation dots for the new requests
      const newDots: AnimDot[] = []
      for (const _req of newRequests) {
        dotIdCounter.current += 1
        newDots.push({
          id: `dot-${dotIdCounter.current}`,
          // targetReplica will be assigned during simulateTick's routing.
          // For now use -1; we'll update after the tick.
          targetReplica: -1,
          cacheHit: false,
          progress: 0,
          born: performance.now(),
        })
      }

      // Advance simulation
      const nextState = simulateTick(state, newRequests)
      simRef.current = nextState
      setSimState(nextState)

      // Update dot targets from the routed requests.
      // The newRequests were mutated by routeRequest during simulateTick.
      const updatedDots = newDots.map((dot, i) => {
        const req = newRequests[i]
        return {
          ...dot,
          targetReplica: req ? req.targetReplicaId : 0,
          cacheHit: req ? req.cacheHit : false,
        }
      })

      // Add new dots, cap at 20
      setDots((prev) => [...prev, ...updatedDots].slice(-20))
    }, tickMs)

    intervalRef.current = id
    return () => window.clearInterval(id)
  }, [running, speed, burst])

  /* ---- animation frame for dot movement ---- */
  useEffect(() => {
    const DOT_DURATION_MS = 800

    const animate = () => {
      const now = performance.now()
      setDots((prev) =>
        prev
          .map((d) => ({
            ...d,
            progress: Math.min(1, (now - d.born) / DOT_DURATION_MS),
          }))
          .filter((d) => d.progress < 1),
      )
      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [])

  /* ---- derived values ---- */
  const { metrics, replicas } = simState
  const activeCount = replicas.filter((r) => r.active).length
  const deadCount = replicas.filter((r) => !r.active).length

  const explanation = POLICY_EXPLANATIONS[policy]

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
        {/* ---- Header ---- */}
        <div
          style={{
            paddingTop: '140px',
            paddingBottom: '48px',
            backgroundColor: '#EDEDED',
          }}
        >
          <div
            style={{
              maxWidth: '1244px',
              margin: '0 auto',
              padding: '0 30px',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '6px 14px',
                backgroundColor: PURPLE,
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '24px',
              }}
            >
              Interactive Tool
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: 300,
                lineHeight: '110%',
                letterSpacing: '-0.02em',
                color: BLACK,
                marginBottom: '20px',
                maxWidth: '800px',
              }}
            >
              Routing Strategy Visualizer
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '20px',
                lineHeight: '32px',
                color: GRAY_600,
                maxWidth: '640px',
              }}
            >
              Watch how different routing policies distribute requests across
              replicas in real time.
            </p>
          </div>
        </div>

        {/* ---- Intro / How to Use ---- */}
        <div
          style={{
            maxWidth: '1244px',
            margin: '0 auto',
            padding: '32px 30px 0',
          }}
        >
          <div
            style={{
              padding: '28px 32px',
              backgroundColor: PURPLE_LIGHT,
              borderRadius: '8px',
              border: `1px solid ${GRAY_200}`,
              marginBottom: '24px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                lineHeight: '28px',
                color: GRAY_600,
                margin: '0 0 20px 0',
                maxWidth: '900px',
              }}
            >
              This simulation models how an llm&#x2011;d cluster routes incoming
              requests to replica workers. Each colored dot is a request. Green
              dots mean the request was routed to a replica that already had the
              relevant data cached (a cache hit), which makes it much faster.
              Grey dots mean no cache was available (a cache miss). Try switching
              between routing policies to see how the distribution and
              performance change.
            </p>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '13px',
                color: BLACK,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '10px',
              }}
            >
              How to use this
            </div>
            <ul
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                lineHeight: '24px',
                color: GRAY_600,
                margin: 0,
                paddingLeft: '20px',
              }}
            >
              <li>
                Switch routing policies using the buttons to see different
                distribution strategies
              </li>
              <li>
                Click "Burst Traffic" to flood the cluster and see how each
                policy handles overload
              </li>
              <li>
                Click "Kill Node" to simulate a replica failure and watch
                requests redistribute
              </li>
              <li>
                Watch the metrics below update in real time as the simulation
                runs
              </li>
            </ul>
          </div>
        </div>

        {/* ---- Controls bar (sticky) ---- */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: '#fff',
            borderBottom: `1px solid ${GRAY_100}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              maxWidth: '1244px',
              margin: '0 auto',
              padding: '14px 30px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            {/* Policy toggles */}
            {POLICIES.map((p) => (
              <PolicyButton
                key={p.id}
                label={p.label}
                active={policy === p.id}
                onClick={() => handlePolicyChange(p.id)}
              />
            ))}

            {/* Separator */}
            <div
              style={{
                width: '1px',
                height: '28px',
                backgroundColor: GRAY_200,
                margin: '0 6px',
              }}
            />

            {/* Action buttons */}
            <ActionButton
              label="Burst Traffic"
              onClick={() => setBurst((b) => !b)}
              color="#e8590c"
              active={burst}
            />
            <ActionButton
              label="Kill Node"
              onClick={handleKill}
              color="#e03131"
            />
            <ActionButton
              label="Reset"
              onClick={handleReset}
              color={GRAY_400}
            />

            {/* Separator */}
            <div
              style={{
                width: '1px',
                height: '28px',
                backgroundColor: GRAY_200,
                margin: '0 6px',
              }}
            />

            {/* Speed */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: GRAY_400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginRight: '4px',
                }}
              >
                Speed
              </span>
              {[1, 2, 3].map((s) => (
                <SpeedButton
                  key={s}
                  label={`${s}x`}
                  active={speed === s}
                  onClick={() => setSpeed(s)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ---- Main content ---- */}
        <div
          style={{
            maxWidth: '1244px',
            margin: '0 auto',
            padding: '40px 30px 80px',
          }}
        >
          {/* ---- Simulation Visualization ---- */}
          <div
            style={{
              position: 'relative',
              minHeight: '360px',
              backgroundColor: GRAY_50,
              borderRadius: '8px',
              border: `1px solid ${GRAY_200}`,
              overflow: 'visible',
              marginBottom: '40px',
              padding: '48px 24px 48px',
            }}
          >
            {/* Status overlay */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                display: 'flex',
                gap: '8px',
                zIndex: 20,
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  padding: '4px 10px',
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: GRAY_600,
                  border: `1px solid ${GRAY_200}`,
                }}
              >
                Tick: {simState.tick}
              </div>
              <div
                style={{
                  padding: '4px 10px',
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: '#2b8a3e',
                  border: `1px solid ${GRAY_200}`,
                }}
              >
                Active: {activeCount}
              </div>
              {deadCount > 0 && (
                <div
                  style={{
                    padding: '4px 10px',
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: '#e03131',
                    border: '1px solid #ffc9c9',
                  }}
                >
                  Dead: {deadCount}
                </div>
              )}
              {burst && (
                <div
                  style={{
                    padding: '4px 10px',
                    backgroundColor: '#fff3bf',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: '#e8590c',
                    border: '1px solid #ffd43b',
                  }}
                >
                  BURST
                </div>
              )}
            </div>

            {/* Router + Replicas layout container */}
            <div
              className="viz-layout"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '24px',
                position: 'relative',
                minHeight: '260px',
              }}
            >
              {/* Router box */}
              <div
                style={{
                  width: '130px',
                  minWidth: '130px',
                  padding: '20px 14px',
                  backgroundColor: PURPLE,
                  borderRadius: '8px',
                  textAlign: 'center',
                  boxShadow: '0 4px 16px rgba(155,77,155,0.3)',
                  zIndex: 10,
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '14px',
                    color: '#fff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '8px',
                  }}
                >
                  Router
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.8)',
                    lineHeight: '16px',
                  }}
                >
                  {explanation.title}
                </div>
                {/* Pulse ring */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    left: '-4px',
                    right: '-4px',
                    bottom: '-4px',
                    borderRadius: '12px',
                    border: `2px solid ${PURPLE}`,
                    opacity: 0.3,
                    animation: 'routerPulse 2s ease-in-out infinite',
                  }}
                />
              </div>

              {/* Dot animation area (fills the gap between router and replicas) */}
              <div
                className="viz-dot-area"
                style={{
                  flex: 1,
                  position: 'relative',
                  minHeight: '260px',
                  alignSelf: 'stretch',
                }}
              >
                {dots.map((dot) => {
                  // Compute which replica index this dot targets.
                  // dot.targetReplica holds the replica *id* (0-based).
                  // We need to find the visual index within the current
                  // replicas array so the dot flies to the correct card.
                  const replicaCount = replicas.length
                  const visualIdx = replicas.findIndex(
                    (r) => r.id === dot.targetReplica,
                  )
                  const replicaIdx = Math.max(
                    0,
                    Math.min(
                      visualIdx >= 0 ? visualIdx : 0,
                      replicaCount - 1,
                    ),
                  )

                  // Y position: distribute evenly across the height
                  const topPadPct = 8
                  const rangeH = 100 - topPadPct * 2
                  const slotHeight = rangeH / replicaCount
                  const targetYPct =
                    topPadPct + slotHeight * replicaIdx + slotHeight * 0.5

                  const startY = 50
                  const currentX = dot.progress * 100
                  const currentY =
                    startY + (targetYPct - startY) * dot.progress

                  return (
                    <div
                      key={dot.id}
                      style={{
                        position: 'absolute',
                        left: `${currentX}%`,
                        top: `${currentY}%`,
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: dot.cacheHit
                          ? '#51cf66'
                          : GRAY_400,
                        boxShadow: dot.cacheHit
                          ? '0 0 8px rgba(81,207,102,0.6)'
                          : '0 0 4px rgba(0,0,0,0.2)',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        zIndex: 5,
                      }}
                    />
                  )
                })}
              </div>

              {/* Replica nodes */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  width: '120px',
                  minWidth: '120px',
                  flexShrink: 0,
                  zIndex: 10,
                }}
              >
                {replicas.map((r) => (
                  <ReplicaNodeCard
                    key={r.id}
                    name={r.name}
                    active={r.active}
                    queueDepth={r.queueDepth}
                    activeRequests={r.activeRequests}
                    kvCacheUtil={r.kvCacheUtilization}
                  />
                ))}
              </div>
            </div>

            {/* Legend */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                marginTop: '16px',
                zIndex: 20,
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#51cf66',
                    boxShadow: '0 0 6px rgba(81,207,102,0.5)',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: GRAY_600,
                  }}
                >
                  Cache hit
                </span>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: GRAY_400,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: GRAY_600,
                  }}
                >
                  Cache miss
                </span>
              </div>
            </div>
          </div>

          {/* ---- Metrics Dashboard ---- */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              marginBottom: '40px',
            }}
          >
            <StatCard
              label="Throughput"
              value={metrics.throughputRPS.toFixed(1)}
              unit="req/s"
              description="Requests completed per second"
            />
            <StatCard
              label="Avg Latency"
              value={String(Math.round(metrics.avgLatencyMs))}
              unit="ms"
              description="Average time from request arrival to completion (milliseconds)"
            />
            <StatCard
              label="Cache Hit Rate"
              value={String(Math.round(metrics.cacheHitRate * 100))}
              unit="%"
              description="Percentage of requests routed to a replica that already had the relevant prefix cached, avoiding redundant computation"
            />
            <StatCard
              label="P99 Latency"
              value={String(Math.round(metrics.p99LatencyMs))}
              unit="ms"
              description="99th percentile latency. 99% of requests complete faster than this. High P99 means some requests are much slower than average."
            />
          </div>

          {/* ---- Explanation Panel ---- */}
          <div
            style={{
              padding: '32px',
              backgroundColor: GRAY_50,
              borderRadius: '8px',
              border: `1px solid ${GRAY_200}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: PURPLE,
                  flexShrink: 0,
                }}
              />
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '20px',
                  color: BLACK,
                  margin: 0,
                }}
              >
                {explanation.title}
              </h3>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                lineHeight: '28px',
                color: GRAY_600,
                margin: 0,
                maxWidth: '800px',
              }}
            >
              {explanation.body}
            </p>
          </div>
        </div>
      </div>

      {/* CSS keyframes for router pulse + responsive layout */}
      <style>{`
        @keyframes routerPulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.06); opacity: 0.15; }
        }
        @media (max-width: 640px) {
          .viz-layout {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .viz-dot-area {
            min-height: 80px !important;
          }
        }
      `}</style>
    </PageTransition>
  )
}
