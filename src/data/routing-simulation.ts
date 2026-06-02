// ---------------------------------------------------------------------------
// Routing Simulation Engine for the llm-d Routing Strategy Visualizer
// Pure-logic module: no React, no DOM, no side effects beyond counters.
// Designed to run at 60fps in the browser -- all operations are lightweight.
// ---------------------------------------------------------------------------

// ---- Types ----------------------------------------------------------------

export type RoutingPolicy =
  | 'round-robin'
  | 'prefix-cache'
  | 'load-aware'
  | 'predicted-latency'

export interface ReplicaNode {
  id: number
  name: string
  active: boolean
  queueDepth: number
  activeRequests: number
  kvCacheUtilization: number // 0-1
  cachedPrefixes: string[] // list of cached prefix IDs
  totalProcessed: number
  totalLatencyMs: number
}

export interface SimRequest {
  id: number
  prefixId: string // which "conversation" this belongs to
  inputTokens: number
  outputTokens: number
  targetReplicaId: number
  state: 'routing' | 'queued' | 'processing' | 'completed' | 'dropped'
  startTime: number // simulation tick
  routedTime: number
  completedTime: number
  latencyMs: number
  cacheHit: boolean
}

export interface SimMetrics {
  totalRequests: number
  completedRequests: number
  droppedRequests: number
  avgLatencyMs: number
  p99LatencyMs: number
  avgTTFTMs: number
  throughputRPS: number
  cacheHitRate: number
  replicaUtilization: number[] // per-replica 0-1
}

export interface SimState {
  tick: number
  replicas: ReplicaNode[]
  activeRequests: SimRequest[]
  completedRequests: SimRequest[]
  metrics: SimMetrics
  policy: RoutingPolicy
}

// ---- Constants ------------------------------------------------------------

export const PREFIX_POOL: string[] = [
  'conv-A',
  'conv-B',
  'conv-C',
  'conv-D',
  'conv-E',
  'conv-F',
  'conv-G',
  'conv-H',
  'conv-I',
  'conv-J',
]

export const ROUTING_POLICY_LABELS: Record<RoutingPolicy, string> = {
  'round-robin': 'Round Robin',
  'prefix-cache': 'Prefix-Aware',
  'load-aware': 'Load-Aware',
  'predicted-latency': 'Predicted Latency',
}

export const ROUTING_POLICY_DESCRIPTIONS: Record<RoutingPolicy, string> = {
  'round-robin':
    'Simple rotating index. Ignores queue depth, cache state, and all other metrics.',
  'prefix-cache':
    'Routes to replicas that already have the request prefix cached, improving KV cache hit rates.',
  'load-aware':
    'Scores replicas by queue depth, active requests, and KV cache utilization to find the least-loaded node.',
  'predicted-latency':
    'Estimates per-replica latency using token counts, cache state, and queue depth, then picks the fastest path.',
}

// Maximum number of cached prefixes a single replica can hold.
const MAX_CACHED_PREFIXES_PER_REPLICA = 8

// Maximum queue depth before a replica starts dropping requests.
const MAX_QUEUE_DEPTH = 20

// Maximum concurrent processing slots per replica.
const MAX_CONCURRENT_PER_REPLICA = 4

// Tracks the round-robin counter outside of state so it persists across ticks.
let roundRobinIndex = 0

// Monotonically increasing request ID counter.
let nextRequestId = 1

// ---- Helpers --------------------------------------------------------------

/** Pick a random element from an array. */
function randomChoice<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Random integer in [min, max] inclusive. */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate a token count skewed toward a target value.
 * Averages a uniform sample with the target to bias the distribution
 * toward that region while still spanning the full [min, max] range.
 */
function skewedTokenCount(min: number, max: number, skewTarget: number): number {
  const uniform = min + Math.random() * (max - min)
  const biased = (uniform + skewTarget) / 2
  return Math.round(Math.max(min, Math.min(max, biased)))
}

/**
 * Compute how long (in simulated ms) it takes a replica to process a request.
 * Cache hits reduce the input-token component significantly.
 */
function estimateProcessingTime(req: SimRequest): number {
  const inputFactor = req.cacheHit ? 0.1 : 0.3
  return req.inputTokens * inputFactor + req.outputTokens * 1.5
}

// ---- Cache helpers --------------------------------------------------------

/**
 * Add a prefix ID to a replica's cached prefixes list.
 * Uses LRU eviction: the oldest entry is removed if the list is at capacity.
 */
function addToCache(replica: ReplicaNode, prefixId: string): void {
  // If already cached, move it to the end (most recently used).
  const existingIdx = replica.cachedPrefixes.indexOf(prefixId)
  if (existingIdx !== -1) {
    replica.cachedPrefixes.splice(existingIdx, 1)
  }

  replica.cachedPrefixes.push(prefixId)

  // Evict oldest if over capacity.
  while (replica.cachedPrefixes.length > MAX_CACHED_PREFIXES_PER_REPLICA) {
    replica.cachedPrefixes.shift()
  }
}

// ---- State creation -------------------------------------------------------

/** Create the initial simulation state with N replicas and a chosen policy. */
export function createInitialState(
  replicaCount: number,
  policy: RoutingPolicy,
): SimState {
  // Reset global counters when a new simulation starts.
  roundRobinIndex = 0
  nextRequestId = 1

  const replicas: ReplicaNode[] = []
  for (let i = 0; i < replicaCount; i++) {
    // Each replica starts with 2-4 random cached prefixes.
    const prefixCount = randomInt(2, 4)
    const prefixes: string[] = []
    const available = [...PREFIX_POOL]
    for (let p = 0; p < prefixCount && available.length > 0; p++) {
      const idx = randomInt(0, available.length - 1)
      prefixes.push(available[idx])
      available.splice(idx, 1)
    }

    replicas.push({
      id: i,
      name: `Replica ${i}`,
      active: true,
      queueDepth: 0,
      activeRequests: 0,
      kvCacheUtilization: Math.random() * 0.3, // start with low utilization
      cachedPrefixes: prefixes,
      totalProcessed: 0,
      totalLatencyMs: 0,
    })
  }

  const metrics: SimMetrics = {
    totalRequests: 0,
    completedRequests: 0,
    droppedRequests: 0,
    avgLatencyMs: 0,
    p99LatencyMs: 0,
    avgTTFTMs: 0,
    throughputRPS: 0,
    cacheHitRate: 0,
    replicaUtilization: replicas.map(() => 0),
  }

  return {
    tick: 0,
    replicas,
    activeRequests: [],
    completedRequests: [],
    metrics,
    policy,
  }
}

// ---- Request generation ---------------------------------------------------

/**
 * Generate one or more new requests for the given tick.
 * In burst mode, 3-5 requests are produced; otherwise exactly 1.
 */
export function generateRequest(tick: number, burstMode: boolean): SimRequest[] {
  const count = burstMode ? randomInt(3, 5) : 1
  const requests: SimRequest[] = []

  for (let i = 0; i < count; i++) {
    requests.push({
      id: nextRequestId++,
      prefixId: randomChoice(PREFIX_POOL),
      inputTokens: skewedTokenCount(200, 4000, 1000),
      outputTokens: randomInt(100, 2000),
      targetReplicaId: -1,
      state: 'routing',
      startTime: tick,
      routedTime: 0,
      completedTime: 0,
      latencyMs: 0,
      cacheHit: false,
    })
  }

  return requests
}

// ---- Routing policies -----------------------------------------------------

/**
 * Select a target replica for a request according to the current policy.
 * Returns the chosen replica ID. Also mutates request.cacheHit when relevant.
 */
export function routeRequest(state: SimState, request: SimRequest): number {
  const active = state.replicas.filter((r) => r.active)
  if (active.length === 0) return -1

  switch (state.policy) {
    case 'round-robin':
      return routeRoundRobin(active)
    case 'prefix-cache':
      return routePrefixCache(active, request)
    case 'load-aware':
      return routeLoadAware(active)
    case 'predicted-latency':
      return routePredictedLatency(active, request)
  }
}

function routeRoundRobin(active: ReplicaNode[]): number {
  const replica = active[roundRobinIndex % active.length]
  roundRobinIndex++
  return replica.id
}

function routePrefixCache(
  active: ReplicaNode[],
  request: SimRequest,
): number {
  // Find replicas that have this prefix cached.
  const matches = active.filter((r) =>
    r.cachedPrefixes.includes(request.prefixId),
  )

  if (matches.length > 0) {
    // Pick the one with the lowest queue depth among matches.
    matches.sort((a, b) => a.queueDepth - b.queueDepth)
    request.cacheHit = true
    return matches[0].id
  }

  // No cache match -- fall back to lowest queue depth.
  const sorted = [...active].sort((a, b) => a.queueDepth - b.queueDepth)
  return sorted[0].id
}

function routeLoadAware(active: ReplicaNode[]): number {
  let bestId = active[0].id
  let bestScore = Infinity

  for (const r of active) {
    const score =
      r.queueDepth * 3 + r.activeRequests * 2 + r.kvCacheUtilization * 1
    if (score < bestScore) {
      bestScore = score
      bestId = r.id
    }
  }

  return bestId
}

function routePredictedLatency(
  active: ReplicaNode[],
  request: SimRequest,
): number {
  let bestId = active[0].id
  let bestLatency = Infinity

  for (const r of active) {
    let predicted =
      request.inputTokens * 0.5 + request.outputTokens * 2

    // Cache hit reduces predicted latency by 40%.
    if (r.cachedPrefixes.includes(request.prefixId)) {
      predicted *= 0.6
    }

    // Queue penalty.
    predicted += r.queueDepth * 200

    if (predicted < bestLatency) {
      bestLatency = predicted
      bestId = r.id
    }
  }

  // Set cacheHit based on the winning replica.
  const winner = active.find((r) => r.id === bestId)
  if (winner && winner.cachedPrefixes.includes(request.prefixId)) {
    request.cacheHit = true
  }

  return bestId
}

// ---- Tick simulation ------------------------------------------------------

/**
 * Advance the simulation by one tick.
 *
 * 1. Route incoming requests to replicas.
 * 2. Move queued requests into processing when capacity allows.
 * 3. Complete requests whose processing time has elapsed.
 * 4. Update replica stats and aggregate metrics.
 */
export function simulateTick(
  state: SimState,
  newRequests: SimRequest[],
): SimState {
  // Shallow-copy top-level state so we do not mutate the previous snapshot.
  const replicas = state.replicas.map((r) => ({
    ...r,
    cachedPrefixes: [...r.cachedPrefixes],
  }))
  let activeRequests = state.activeRequests.map((r) => ({ ...r }))
  const completedRequests = [...state.completedRequests]
  const tick = state.tick + 1

  // Build a quick lookup map: replicaId -> replica reference.
  const replicaMap = new Map<number, ReplicaNode>()
  for (const r of replicas) replicaMap.set(r.id, r)

  // -- 1. Route new requests ------------------------------------------------
  for (const req of newRequests) {
    const targetId = routeRequest(
      { ...state, replicas, activeRequests, completedRequests, tick },
      req,
    )

    // Propagate the routed target back onto the original request object
    // so the UI animation layer can read it after simulateTick returns.
    req.targetReplicaId = targetId

    const routed: SimRequest = { ...req }
    routed.targetReplicaId = targetId
    routed.routedTime = tick

    const target = replicaMap.get(targetId)
    if (!target || !target.active || target.queueDepth >= MAX_QUEUE_DEPTH) {
      // Drop the request if the target is invalid, inactive, or overloaded.
      routed.state = 'dropped'
      routed.completedTime = tick
      completedRequests.push(routed)
    } else {
      routed.state = 'queued'
      target.queueDepth++
      activeRequests.push(routed)
    }
  }

  // -- 2. Process requests on each replica ----------------------------------
  const newlyCompleted: SimRequest[] = []

  for (const replica of replicas) {
    if (!replica.active) continue

    // Gather this replica's active requests.
    const replicaRequests = activeRequests.filter(
      (r) => r.targetReplicaId === replica.id,
    )

    const queued = replicaRequests.filter((r) => r.state === 'queued')
    const processing = replicaRequests.filter((r) => r.state === 'processing')

    // Check processing requests for completion.
    for (const req of processing) {
      const elapsed = (tick - req.routedTime) * 16 // ~16ms per tick at 60fps
      const needed = estimateProcessingTime(req)

      if (elapsed >= needed) {
        req.state = 'completed'
        req.completedTime = tick
        req.latencyMs = elapsed
        newlyCompleted.push(req)

        replica.totalProcessed++
        replica.totalLatencyMs += req.latencyMs

        // Add the prefix to the replica cache (LRU eviction if needed).
        addToCache(replica, req.prefixId)
      }
    }

    // Promote queued requests to processing if there is capacity.
    const currentProcessing = processing.filter(
      (r) => r.state === 'processing', // still processing after completion check
    ).length
    const slotsAvailable = MAX_CONCURRENT_PER_REPLICA - currentProcessing

    for (let i = 0; i < Math.min(slotsAvailable, queued.length); i++) {
      queued[i].state = 'processing'
    }

    // Update replica stats.
    const updatedReplicaReqs = activeRequests.filter(
      (r) =>
        r.targetReplicaId === replica.id &&
        r.state !== 'completed' &&
        r.state !== 'dropped',
    )
    replica.queueDepth = updatedReplicaReqs.filter(
      (r) => r.state === 'queued',
    ).length
    replica.activeRequests = updatedReplicaReqs.filter(
      (r) => r.state === 'processing',
    ).length

    // KV cache utilization grows with active requests and cached prefixes.
    const prefixLoad = replica.cachedPrefixes.length / MAX_CACHED_PREFIXES_PER_REPLICA
    const requestLoad = replica.activeRequests / MAX_CONCURRENT_PER_REPLICA
    replica.kvCacheUtilization = Math.min(
      1,
      prefixLoad * 0.6 + requestLoad * 0.4,
    )
  }

  // Move completed requests from active to completed.
  for (const req of newlyCompleted) {
    completedRequests.push(req)
  }
  activeRequests = activeRequests.filter(
    (r) => r.state !== 'completed' && r.state !== 'dropped',
  )

  // Trim completed history to avoid unbounded growth.
  const trimmedCompleted =
    completedRequests.length > 500
      ? completedRequests.slice(-500)
      : completedRequests

  const nextState: SimState = {
    tick,
    replicas,
    activeRequests,
    completedRequests: trimmedCompleted,
    metrics: state.metrics, // placeholder, recomputed below
    policy: state.policy,
  }

  nextState.metrics = computeMetrics(nextState)
  return nextState
}

// ---- Replica management ---------------------------------------------------

/** Deactivate a replica and redistribute its queued requests. */
export function killReplica(state: SimState, replicaId: number): SimState {
  const replicas = state.replicas.map((r) => ({
    ...r,
    cachedPrefixes: [...r.cachedPrefixes],
  }))
  let activeRequests = state.activeRequests.map((r) => ({ ...r }))
  const completedRequests = [...state.completedRequests]

  const target = replicas.find((r) => r.id === replicaId)
  if (!target) return state

  target.active = false
  target.queueDepth = 0
  target.activeRequests = 0

  // Collect requests that were assigned to the killed replica.
  const orphaned = activeRequests.filter(
    (r) =>
      r.targetReplicaId === replicaId &&
      (r.state === 'queued' || r.state === 'processing'),
  )

  // Remove orphans from active list; we will re-route them.
  activeRequests = activeRequests.filter(
    (r) =>
      !(
        r.targetReplicaId === replicaId &&
        (r.state === 'queued' || r.state === 'processing')
      ),
  )

  // Build a temporary state with the updated replicas for routing.
  const tempState: SimState = {
    ...state,
    replicas,
    activeRequests,
    completedRequests,
  }

  // Re-route orphaned requests.
  for (const req of orphaned) {
    req.state = 'routing'
    const newTarget = routeRequest(tempState, req)
    const replica = replicas.find((r) => r.id === newTarget)

    if (!replica || !replica.active || replica.queueDepth >= MAX_QUEUE_DEPTH) {
      req.state = 'dropped'
      req.completedTime = state.tick
      completedRequests.push(req)
    } else {
      req.targetReplicaId = newTarget
      req.state = 'queued'
      replica.queueDepth++
      activeRequests.push(req)
    }
  }

  const nextState: SimState = {
    ...state,
    replicas,
    activeRequests,
    completedRequests,
  }
  nextState.metrics = computeMetrics(nextState)
  return nextState
}

/** Reactivate a previously killed replica with fresh state. */
export function reviveReplica(state: SimState, replicaId: number): SimState {
  const replicas = state.replicas.map((r) => ({
    ...r,
    cachedPrefixes: [...r.cachedPrefixes],
  }))

  const target = replicas.find((r) => r.id === replicaId)
  if (!target) return state

  target.active = true
  target.queueDepth = 0
  target.activeRequests = 0
  target.kvCacheUtilization = 0
  target.cachedPrefixes = []
  target.totalProcessed = 0
  target.totalLatencyMs = 0

  const nextState: SimState = {
    ...state,
    replicas,
  }
  nextState.metrics = computeMetrics(nextState)
  return nextState
}

// ---- Metrics computation --------------------------------------------------

/** Compute aggregate metrics from the current simulation state. */
export function computeMetrics(state: SimState): SimMetrics {
  const completed = state.completedRequests.filter(
    (r) => r.state === 'completed',
  )
  const dropped = state.completedRequests.filter(
    (r) => r.state === 'dropped',
  )
  const totalRequests =
    state.activeRequests.length + state.completedRequests.length
  const completedCount = completed.length
  const droppedCount = dropped.length

  // Average latency.
  let avgLatencyMs = 0
  if (completedCount > 0) {
    const sum = completed.reduce((acc, r) => acc + r.latencyMs, 0)
    avgLatencyMs = sum / completedCount
  }

  // P99 latency.
  let p99LatencyMs = 0
  if (completedCount > 0) {
    const sorted = completed.map((r) => r.latencyMs).sort((a, b) => a - b)
    const idx = Math.min(
      Math.floor(completedCount * 0.99),
      completedCount - 1,
    )
    p99LatencyMs = sorted[idx]
  }

  // Average time to first token (approximated as queue wait time plus
  // the prefill phase of input token processing).
  let avgTTFTMs = 0
  if (completedCount > 0) {
    const ttfts = completed.map((r) => {
      const queueWait = (r.routedTime - r.startTime) * 16
      const inputFactor = r.cacheHit ? 0.1 : 0.3
      const prefill = r.inputTokens * inputFactor
      return queueWait + prefill
    })
    avgTTFTMs = ttfts.reduce((a, b) => a + b, 0) / completedCount
  }

  // Throughput: completed requests per simulated second.
  // Each tick is ~16ms, so ticks per second = 62.5.
  let throughputRPS = 0
  if (state.tick > 0) {
    const elapsedSeconds = (state.tick * 16) / 1000
    throughputRPS = completedCount / Math.max(elapsedSeconds, 0.001)
  }

  // Cache hit rate.
  let cacheHitRate = 0
  if (completedCount > 0) {
    const hits = completed.filter((r) => r.cacheHit).length
    cacheHitRate = hits / completedCount
  }

  // Per-replica utilization: ratio of active processing slots used.
  const replicaUtilization = state.replicas.map((r) => {
    if (!r.active) return 0
    return Math.min(
      1,
      (r.activeRequests + r.queueDepth * 0.5) / MAX_CONCURRENT_PER_REPLICA,
    )
  })

  return {
    totalRequests,
    completedRequests: completedCount,
    droppedRequests: droppedCount,
    avgLatencyMs: Math.round(avgLatencyMs * 100) / 100,
    p99LatencyMs: Math.round(p99LatencyMs * 100) / 100,
    avgTTFTMs: Math.round(avgTTFTMs * 100) / 100,
    throughputRPS: Math.round(throughputRPS * 100) / 100,
    cacheHitRate: Math.round(cacheHitRate * 1000) / 1000,
    replicaUtilization,
  }
}

// ---- Utility exports for the UI -------------------------------------------

/** Reset the global request ID counter (useful when restarting the sim). */
export function resetRequestCounter(): void {
  nextRequestId = 1
  roundRobinIndex = 0
}

/** Get a human-readable color class for a request state. */
export function requestStateColor(
  reqState: SimRequest['state'],
): string {
  switch (reqState) {
    case 'routing':
      return 'text-yellow-500'
    case 'queued':
      return 'text-blue-400'
    case 'processing':
      return 'text-green-500'
    case 'completed':
      return 'text-gray-400'
    case 'dropped':
      return 'text-red-500'
  }
}

/** Get a human-readable label for a request state. */
export function requestStateLabel(
  reqState: SimRequest['state'],
): string {
  switch (reqState) {
    case 'routing':
      return 'Routing'
    case 'queued':
      return 'Queued'
    case 'processing':
      return 'Processing'
    case 'completed':
      return 'Completed'
    case 'dropped':
      return 'Dropped'
  }
}
