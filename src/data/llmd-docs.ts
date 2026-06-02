export interface DocChunk {
  topic: string
  keywords: string[]
  content: string
}

export const docs: DocChunk[] = [
  {
    topic: 'What is llm-d',
    keywords: [
      'what', 'llm-d', 'about', 'overview', 'introduction', 'purpose',
      'project', 'open source', 'cncf', 'sandbox', 'apache', 'license',
      'red hat', 'google', 'ibm', 'coreweave', 'nvidia', 'founded',
    ],
    content: `llm-d is a high-performance distributed inference serving stack designed for Kubernetes. It orchestrates model server pods (vLLM or SGLang) to deliver optimized large language model inference at scale.

llm-d is a CNCF sandbox project, founded by Red Hat, Google Cloud, IBM Research, CoreWeave, and NVIDIA. It is released under the Apache 2.0 license, making it fully open source.

The project provides intelligent request routing, disaggregated prefill/decode serving, hierarchical KV cache management, SLO-aware autoscaling, and multi-model support. It is designed to maximize GPU utilization and minimize inference latency across clusters of accelerators.

Official website: https://llm-d.ai
GitHub repository: https://github.com/llm-d/llm-d`,
  },
  {
    topic: 'Architecture',
    keywords: [
      'architecture', 'components', 'design', 'structure', 'system',
      'router', 'inferencepool', 'model server', 'proxy', 'epp',
      'endpoint picker', 'core concepts', 'how it works',
    ],
    content: `The llm-d architecture is built around three core concepts:

1. Router (Proxy + Endpoint Picker EPP): The intelligent entry point for all inference requests. The Proxy is an Envoy-based L7 proxy that forwards traffic. The Endpoint Picker (EPP) selects the optimal backend pod using a pluggable scoring pipeline.

2. InferencePool: A Kubernetes Custom Resource that defines a group of model server pods sharing the same model and configuration. It acts as an "LLM-optimized Service" that the router uses for discovery and load management.

3. Model Server: The actual inference engine running on GPUs or TPUs. llm-d supports vLLM and SGLang as model server backends. Each model server pod runs on one or more accelerators and handles the actual token generation.

These three components work together: requests arrive at the Router, which consults the InferencePool to find available model server pods, then the EPP selects the best pod based on cache state, load, and predicted latency.`,
  },
  {
    topic: 'Router and EPP',
    keywords: [
      'router', 'epp', 'endpoint picker', 'proxy', 'envoy', 'routing',
      'scoring', 'pipeline', 'ext-proc', 'entry point', 'request routing',
      'prefix cache', 'kv cache utilization', 'queue depth', 'pluggable',
    ],
    content: `The Router is the intelligent entry point for all llm-d inference requests. It consists of two subcomponents:

1. Proxy: An Envoy-based L7 proxy that handles HTTP/gRPC traffic. It communicates with the EPP via the ext-proc (external processing) protocol to determine where to route each request.

2. Endpoint Picker (EPP): The decision-making component that selects the best model server pod for each request. It uses a pluggable scoring pipeline that evaluates candidates based on multiple signals:
   - Prefix cache locality: whether the pod already has matching KV cache entries for the request prefix
   - KV cache utilization: how much of the pod's cache memory is in use
   - Queue depth: how many requests are currently waiting on each pod

The EPP scoring pipeline is pluggable, meaning operators can customize the scoring weights or add new scoring criteria. The EPP communicates with the Proxy via the ext-proc protocol, a standard Envoy extension mechanism for external request processing.

The Router supports active-active high availability, where multiple router replicas run concurrently behind a load balancer.`,
  },
  {
    topic: 'Routing Policies',
    keywords: [
      'routing', 'policy', 'policies', 'prefix-cache', 'cache-aware',
      'load-aware', 'predicted-latency', 'xgboost', 'lora', 'round-robin',
      'throughput', 'ttft', 'time-to-first-token', 'itl', 'inter-token',
      'latency', 'performance', 'benchmark',
    ],
    content: `llm-d supports several routing policies, each optimized for different objectives:

1. Prefix-cache-aware routing: Routes requests to workers that already have matching KV cache entries for the prompt prefix. This avoids redundant computation. Benchmarks show approximately 3x throughput improvement and 2x TTFT (time-to-first-token) reduction compared to round-robin routing on Llama 3.1 70B with 4x MI300X GPUs.

2. Load-aware balancing: Monitors queue depth and KV cache utilization across all workers, steering new requests to the least loaded instance to prevent hot spots and smooth tail latencies.

3. Predicted-latency routing: Uses an XGBoost model trained on request characteristics (token count, cache hit ratio, queue state) to predict per-worker latency. Routes to the worker with the lowest predicted completion time. Achieves approximately 40% reduction in both TTFT and ITL (inter-token latency).

4. Cache-aware LoRA routing: For multi-tenant deployments using LoRA adapters, this policy routes requests to workers that already have the required adapter loaded, avoiding adapter swap overhead.

These policies can be combined and configured per InferencePool.`,
  },
  {
    topic: 'Disaggregated Serving',
    keywords: [
      'disaggregated', 'disaggregation', 'prefill', 'decode', 'split',
      'separation', 'compute-bound', 'memory-bandwidth', 'nixl',
      'infiniband', 'roce', 'rdma', 'kv transfer', 'b200', 'topology',
      'tokens per second', 'throughput', 'autoregressive',
    ],
    content: `Disaggregated serving is a core capability of llm-d that splits inference into two separate phases, each running on dedicated worker pools:

1. Prefill phase (compute-bound): Processes all input tokens in parallel through the model's attention layers. This involves dense matrix multiplications and is limited by GPU compute (FLOPS). Prefill workers are optimized for high compute throughput.

2. Decode phase (memory-bandwidth-bound): Generates output tokens one at a time in an autoregressive fashion. Each new token requires reading the full KV cache from memory. This phase is limited by memory bandwidth (TB/s), not compute.

When both phases share the same GPU, they contend for resources: a long prefill blocks decode for in-flight requests, causing latency spikes. Disaggregation eliminates this contention.

The KV cache computed during prefill is transferred between prefill and decode workers using NIXL (NVIDIA's Interconnect eXchange Library) over InfiniBand or RoCE RDMA networks, enabling high-speed data movement.

Performance results: Disaggregated serving on B200 GPUs achieves 70% higher tokens/sec compared to combined serving. A validated 16x16 B200 topology (16 prefill + 16 decode GPUs) sustains over 50,000 output tokens per second.`,
  },
  {
    topic: 'KV Cache Management',
    keywords: [
      'kv cache', 'cache', 'prefix', 'indexing', 'offloading', 'tiered',
      'hierarchical', 'gpu', 'hbm', 'cpu', 'dram', 'disk', 'nvme',
      'memory', 'reuse', 'global index', 'event-driven', 'h100',
      'throughput', 'cache hit', 'eviction',
    ],
    content: `llm-d provides advanced KV cache management across three areas:

1. Prefix-cache-aware routing: The router knows which prefixes are cached on which workers and routes requests accordingly to maximize cache reuse.

2. KV-cache indexing: A real-time global index tracks KV cache entries across the entire cluster using event-driven tracking. When a worker computes and stores KV state for a prefix, the index is updated immediately. The router queries this index to make cache-aware routing decisions.

3. KV offloading: A hierarchical storage system with three tiers:
   - GPU HBM (High Bandwidth Memory): Fastest tier, limited to tens of GB per device. Hot prefixes and in-flight request state reside here.
   - CPU DRAM: Moderate bandwidth, hundreds of GB per node. Warm prefixes evicted from GPU memory are held here.
   - Disk/NVMe: Highest capacity, lowest bandwidth. Cold prefixes and long-lived conversational state are persisted here.

Benchmark: On a 4x H100 cluster with 250 concurrent users, the hierarchical cache achieves 13.9x throughput compared to a GPU-only cache baseline. Evicted prefixes can be restored from CPU or disk rather than recomputed from scratch.`,
  },
  {
    topic: 'Autoscaling',
    keywords: [
      'autoscaling', 'autoscaler', 'scaling', 'scale', 'hpa', 'keda',
      'metrics', 'queue depth', 'request counts', 'wva', 'workload variant',
      'slo', 'scale-to-zero', 'cold start', 'idle', 'multi-model',
      'heterogeneous', 'hardware',
    ],
    content: `llm-d provides inference-aware autoscaling through several mechanisms:

1. HPA/KEDA integration: Uses Kubernetes Horizontal Pod Autoscaler (HPA) or KEDA with EPP-exported metrics including queue depth and request counts. This allows scaling based on inference-specific signals rather than generic CPU/memory metrics.

2. Workload Variant Autoscaler (WVA): A multi-model, SLO-aware autoscaler for heterogeneous hardware environments. It solves a constrained optimization problem: given per-model SLO targets, observed latency/throughput, and available GPU resources, it dynamically reallocates GPUs across model pools to minimize total cost while meeting all SLO targets.

3. Scale-to-zero: Models with intermittent or low traffic can scale down to zero replicas when idle, eliminating GPU costs during inactive periods. On the next request, workers are provisioned, the model is loaded, and the request is served. Cold start time depends on model size and storage backend. This is particularly useful for development, staging, and low-traffic LoRA adapters.

Prefill and decode pools scale independently, so operators can add prefill capacity during request bursts without over-provisioning decode workers, and vice versa.`,
  },
  {
    topic: 'Flow Control',
    keywords: [
      'flow control', 'queuing', 'queue', 'fairness', 'multi-tenant',
      'priority', 'dispatch', 'late-binding', 'scheduling', 'slo',
      'guardrails', 'true demand', 'batch', 'interactive', 'tenant',
      'round-robin', 'centralized',
    ],
    content: `llm-d implements sophisticated flow control within the EPP (Endpoint Picker) to manage request scheduling:

1. Centralized queuing: The EPP maintains a centralized request queue, giving it a global view of demand across the cluster. This enables smarter scheduling decisions compared to per-worker queuing.

2. Multi-tenant fairness: Requests are tagged with tenant IDs. The EPP uses round-robin scheduling across tenants to ensure fair resource allocation, preventing any single tenant from monopolizing the system.

3. Strict priority dispatch: Requests can be classified by priority level (e.g., interactive vs. batch). Interactive requests are dispatched ahead of batch requests, ensuring low latency for user-facing traffic.

4. Late-binding scheduling: The EPP delays the worker assignment decision until a worker is actually available to process the request. This avoids head-of-line blocking and improves utilization.

5. Proactive SLO guardrails: The system monitors request latency against SLO targets and can proactively shed or deprioritize requests that are unlikely to meet their SLO, protecting the quality of service for other requests.

6. "True Demand" metric: The EPP exports a metric that reflects actual demand including queued requests, not just active requests. This gives autoscalers an accurate signal for scaling decisions.`,
  },
  {
    topic: 'Batch Inference',
    keywords: [
      'batch', 'batch inference', 'batch api', 'openai', 'v1/batches',
      'v1/files', 'batch gateway', 'async', 'processor', 'redis',
      'pub/sub', 'google pub/sub', 'job management', 'offline',
    ],
    content: `llm-d provides a full batch inference pipeline for offline and asynchronous workloads:

1. OpenAI-compatible Batch APIs: Implements the /v1/batches and /v1/files endpoints following the OpenAI batch API specification. Applications already using the OpenAI batch API can switch to llm-d without code changes.

2. Batch Gateway: A centralized service for batch job management. It handles job submission, status tracking, result retrieval, and lifecycle management. Jobs can be submitted with priority levels and SLO targets.

3. Async Processor: A worker component that pulls batch requests from message queues (Redis or Google Pub/Sub) and processes them through the inference pipeline with flow control. The processor integrates with llm-d's flow control system to ensure batch workloads do not interfere with real-time interactive traffic.

Batch inference is designed for workloads like document processing, data labeling, evaluation runs, and other scenarios where results are not needed immediately. It uses lower-priority scheduling to maximize GPU utilization during off-peak periods.`,
  },
  {
    topic: 'Wide Expert Parallelism',
    keywords: [
      'expert parallelism', 'moe', 'mixture of experts', 'deepseek',
      'deepseek-r1', 'deepseek v3', 'data parallelism', 'wide',
      'leaderworkerset', 'multi-node', 'coordination', 'tok/s', 'b200',
      'expert', 'parallel',
    ],
    content: `llm-d supports wide expert parallelism for serving large Mixture-of-Experts (MoE) models such as DeepSeek-R1 and DeepSeek V3.1.

MoE models activate only a subset of "expert" subnetworks for each token, but all expert weights must be resident in memory. This creates a large memory footprint relative to the compute actually used per forward pass.

llm-d addresses this with combined data parallelism + expert parallelism:
- Expert parallelism distributes expert weights across multiple GPUs, so each device holds a manageable subset. When a token activates experts on a remote device, inter-GPU communication handles the routing transparently.
- Data parallelism replicates the shared (non-expert) layers across devices, processing multiple requests in parallel.

Performance: Approximately 3,100 tokens/second per GPU on NVIDIA B200 hardware using wide expert parallelism with DeepSeek models.

Multi-node coordination uses LeaderWorkerSet (LWS), a Kubernetes API that manages groups of pods where one pod acts as the leader and coordinates the worker pods. This is essential for multi-node inference where model weights span multiple machines.`,
  },
  {
    topic: 'Hardware Support',
    keywords: [
      'hardware', 'gpu', 'tpu', 'nvidia', 'amd', 'intel', 'google',
      'h100', 'h200', 'b200', 'mi300x', 'xpu', 'gaudi', 'accelerator',
      'supported', 'platform', 'openshift', 'gke', 'coreweave', 'aks',
      'minikube', 'digitalocean', 'cloud',
    ],
    content: `llm-d supports a wide range of hardware accelerators and deployment platforms:

Hardware accelerators:
- NVIDIA: H100, H200, B200. This is the primary development and benchmark platform.
- AMD: MI300X. Supported via the ROCm-compatible vLLM backend.
- Intel: XPU and Gaudi accelerators. Supported for inference workloads.
- Google: Cloud TPU. Supported for TPU-based deployments.

Tested deployment platforms:
- Red Hat OpenShift (including OpenShift on AWS)
- Google Kubernetes Engine (GKE)
- CoreWeave Kubernetes
- Azure Kubernetes Service (AKS)
- minikube (for local development and testing)
- DigitalOcean Kubernetes

llm-d runs on any Kubernetes-conformant cluster, but has been specifically tested and validated on the platforms listed above. Deployment guides are available for each platform.`,
  },
  {
    topic: 'Kubernetes APIs',
    keywords: [
      'kubernetes', 'k8s', 'api', 'leaderworkerset', 'lws',
      'disaggregatedset', 'gateway api', 'custom resource', 'crd',
      'labels', 'hpa', 'multi-node', 'lifecycle', 'prefill', 'decode',
    ],
    content: `llm-d uses several Kubernetes APIs and custom resources:

1. LeaderWorkerSet (LWS): A Kubernetes API for managing multi-node inference workloads. LWS groups pods where one pod acts as the leader and coordinates the workers. This is used for tensor-parallel and expert-parallel inference that spans multiple nodes.

2. DisaggregatedSet: A custom resource for managing the lifecycle of disaggregated prefill and decode worker pools. It handles coordinated scaling, rolling updates, and health management for the separate prefill and decode StatefulSets.

3. Gateway API: llm-d integrates with the standard Kubernetes Gateway API for ingress traffic management, providing a consistent interface for routing external traffic to the inference stack.

4. Custom Resources (CRDs): InferencePool is the primary custom resource, defining a group of model server pods sharing the same model and configuration. Additional CRDs manage routing policies and autoscaling configurations.

5. Labels and selectors: Used extensively for pod discovery, routing decisions, and autoscaler targeting. Standard Kubernetes label conventions are followed.

6. HPA (Horizontal Pod Autoscaler): Integrated with custom metrics from the EPP for inference-aware scaling decisions.`,
  },
  {
    topic: 'Deployment',
    keywords: [
      'deployment', 'deploy', 'install', 'setup', 'helm', 'kustomize',
      'charts', 'manifests', 'well-lit', 'recipes', 'optimized baseline',
      'guide', 'gke', 'openshift', 'aws', 'aks', 'minikube',
      'digitalocean', 'getting started',
    ],
    content: `llm-d provides multiple deployment options:

1. Helm charts: Pre-built Helm charts for deploying the full llm-d stack. These charts are configurable via values files for different hardware configurations, model sizes, and scaling policies.

2. Kustomize manifests: Kustomize overlays for operators who prefer declarative YAML-based configuration. Manifests can be customized without modifying the base templates.

3. Well-lit paths: These are tested deployment recipes that have been validated end-to-end on specific platforms and hardware combinations. They provide a known-good starting point.

4. Optimized Baseline: A recommended starting configuration that includes sensible defaults for routing policy, autoscaling thresholds, and resource allocation. Start with the Optimized Baseline guide and adjust from there.

Platform-specific deployment guides are available for:
- Google Kubernetes Engine (GKE)
- Red Hat OpenShift on AWS
- Azure Kubernetes Service (AKS)
- minikube (local development)
- DigitalOcean Kubernetes

Each guide covers prerequisites, cluster setup, model deployment, and validation steps.`,
  },
  {
    topic: 'InferencePool',
    keywords: [
      'inferencepool', 'pool', 'custom resource', 'crd', 'pods',
      'model server', 'discovery', 'service', 'group', 'configuration',
      'kubernetes', 'llm service',
    ],
    content: `InferencePool is a Kubernetes Custom Resource that is central to llm-d's architecture. It defines a group of model server pods that share the same model and configuration.

Key characteristics:
- Acts as an "LLM-optimized Service": Similar to a Kubernetes Service, but designed specifically for inference workloads. It provides service discovery for the router and load management capabilities.
- Pod grouping: All pods in an InferencePool run the same model with the same configuration (tensor parallelism, quantization settings, etc.).
- Router discovery: The router uses InferencePool resources to discover available backend pods and their current state (cache contents, queue depth, utilization).
- Configuration: The InferencePool spec defines the model name, serving parameters, resource requirements, and scaling bounds.
- Multiple pools: A cluster can have multiple InferencePool resources, each serving a different model or a different configuration of the same model.

InferencePool integrates with the autoscaler, which monitors pool-level metrics and adjusts replica counts within the bounds defined in the InferencePool spec.`,
  },
  {
    topic: 'Metrics and Observability',
    keywords: [
      'metrics', 'observability', 'monitoring', 'tracing', 'distributed tracing',
      'queue depth', 'request counts', 'cache hit', 'cache hit rate',
      'prometheus', 'telemetry', 'dashboards', 'signals', 'grafana',
      'prometheus adapter', 'hpa', 'dashboard recipes',
    ],
    content: `llm-d provides comprehensive observability features:

1. Grafana dashboards: The llm-d project includes dashboard recipes in guides/recipes/observability that provide pre-built Grafana dashboards for monitoring inference workloads. These dashboards visualize queue depth, cache hit rates, per-replica metrics, request latencies, and throughput in real time.

2. Distributed tracing: Support for distributed tracing across the inference pipeline, allowing operators to trace a request from the router through prefill, KV cache operations, and decode to the final response.

3. EPP-exported metrics: The Endpoint Picker exports key metrics that are used for both monitoring and autoscaling:
   - Queue depth: Number of requests waiting to be processed on each worker
   - Request counts: Total and per-second request rates by model and pool
   - Cache hit rates: Percentage of requests that found matching KV cache entries, indicating routing efficiency

4. Prometheus adapter for HPA: llm-d integrates with the Prometheus adapter to expose EPP metrics as custom metrics for the Kubernetes Horizontal Pod Autoscaler. This allows HPA to scale based on inference-specific signals such as queue depth and request rates rather than generic CPU or memory utilization.

5. Autoscaling signals: These metrics feed directly into the HPA/KEDA autoscaler and the Workload Variant Autoscaler (WVA) for making informed scaling decisions based on actual inference workload characteristics.

6. "True Demand" metric: Reflects actual demand including queued requests, not just in-flight requests. This provides autoscalers with an accurate view of total system load.`,
  },
  {
    topic: 'Model Servers',
    keywords: [
      'model server', 'vllm', 'sglang', 'inference engine', 'backend',
      'serving', 'patches', 'optimization', 'kv cache features',
      'disaggregation',
    ],
    content: `llm-d supports two model server backends:

1. vLLM: An open-source, high-throughput model serving engine that implements PagedAttention for efficient memory management and supports continuous batching. llm-d applies optimization patches to vLLM to enable advanced KV cache features (hierarchical offloading, global indexing) and disaggregated serving capabilities.

2. SGLang: An alternative model serving engine supported by llm-d. SGLang provides its own set of optimizations for inference serving.

The model server is the component that runs directly on GPU or TPU hardware and performs the actual neural network computations for token generation. Each model server pod in an InferencePool runs the same model with the same configuration.

llm-d is model-server-agnostic at the architecture level: the Router and EPP communicate with model servers via standard APIs, and the InferencePool abstraction hides backend differences from the routing layer.`,
  },
  {
    topic: 'Quickstart',
    keywords: [
      'quickstart', 'quick start', 'getting started', 'start', 'begin',
      'tutorial', 'first steps', 'setup', 'install', 'try', 'run',
      'hello world', 'basic',
    ],
    content: `To get started with llm-d:

1. Start with the Optimized Baseline guide. This provides a recommended starting configuration with sensible defaults for routing, autoscaling, and resource allocation.

2. Choose your deployment platform. llm-d has tested deployment guides for GKE, OpenShift on AWS, AKS, minikube (local development), and DigitalOcean.

3. Deploy using Helm charts or kustomize manifests. Helm charts are available in the llm-d repository and provide configurable values for different hardware and model configurations.

4. Basic requirements:
   - A Kubernetes cluster with GPU nodes
   - kubectl configured for your cluster
   - Helm 3.x installed (if using Helm deployment)

5. Key resources:
   - Official documentation: https://llm-d.ai
   - GitHub repository: https://github.com/llm-d/llm-d
   - Community Slack for support and discussion

The llm-d project follows a "well-lit path" approach, providing tested deployment recipes that have been validated end-to-end on specific platforms and hardware combinations.`,
  },
  {
    topic: 'Transport and High Availability',
    keywords: [
      'transport', 'uccl', 'communication', 'high availability', 'ha',
      'active-active', 'router ha', 'infiniband', 'roce', 'rdma',
      'reliable', 'inter-node', 'collective',
    ],
    content: `llm-d addresses transport and high availability through several mechanisms:

1. UCCL-based transport: UCCL (Unified Collective Communication Library) provides reliable, high-performance communication between disaggregated workers. It optimizes collective operations (all-reduce, all-gather) across GPU interconnects including InfiniBand and RoCE RDMA fabrics. This minimizes communication overhead in multi-node inference deployments where model weights and KV cache data must be exchanged between nodes.

2. Active-active HA for the Router: Multiple router replicas run concurrently behind a load balancer, each maintaining an up-to-date view of worker health and cache state. If a router instance fails, traffic is seamlessly handled by the remaining replicas with no request loss or cache index staleness. This provides continuous availability without a standby failover delay.

3. KV cache transfer: For disaggregated serving, the KV cache computed during prefill is transferred to decode workers using NIXL (NVIDIA's Interconnect eXchange Library) over InfiniBand or RoCE RDMA networks, enabling high-throughput, low-latency data movement between the separate worker pools.`,
  },
  {
    topic: 'Well-Lit Paths',
    keywords: [
      'well-lit', 'well-lit paths', 'paths', 'recipes', 'deployment recipes',
      'tested', 'benchmarked', 'validated', 'optimized baseline',
      'predicted latency', 'precise prefix cache', 'tiered prefix cache',
      'disaggregation', 'wide expert parallelism', 'flow control',
      'workload autoscaling', 'rollouts', 'async processing',
      'batch gateway', 'experimental',
    ],
    content: `Well-lit paths are tested, benchmarked deployment recipes that have been validated end-to-end on specific platforms and hardware combinations. They provide a known-good starting point for production deployments.

llm-d provides 9 well-lit paths organized into three categories:

Intelligent Routing:
1. Optimized Baseline - the recommended starting configuration with prefix-cache-scorer and load-aware scoring for balanced throughput and latency
2. Predicted Latency - uses an XGBoost model trained on live traffic to route requests to the replica predicted to serve them fastest
3. Precise Prefix Cache - enables event-driven KV-cache indexing via ZMQ for exact block-level cache scoring instead of heuristic estimation

Serving at Scale:
4. Tiered Prefix Cache - configures hierarchical KV cache offloading from GPU to CPU to disk to expand effective cache capacity
5. Prefill/Decode Disaggregation - separates prefill and decode phases onto dedicated worker pools for higher throughput and lower latency
6. Wide Expert Parallelism - deploys large MoE models like DeepSeek-R1 across multiple nodes using LeaderWorkerSet with combined DP/EP

Operations:
7. Flow Control - configures priority bands, multi-tenant fairness, and late-binding scheduling
8. Workload Autoscaling - sets up HPA with EPP metrics and the Workload Variant Autoscaler for multi-model cost optimization
9. Rollouts - performs incremental rollouts of LoRA adapters, base models, or model server versions with traffic splitting

Additionally, two experimental paths are available:
- Async Processing - pulls inference requests from Redis or Google Pub/Sub with flow-control gating
- Batch Gateway - manages batch jobs via the OpenAI-compatible /v1/batches API`,
  },
  {
    topic: 'Rollouts',
    keywords: [
      'rollout', 'rollouts', 'incremental', 'canary', 'traffic splitting',
      'gradual deployment', 'lora', 'adapter', 'base model',
      'model server version', 'upgrade', 'regression', 'deployment strategy',
    ],
    content: `llm-d supports incremental rollout operations for safely deploying changes to LoRA adapters, base models, and model server versions.

Key capabilities:

1. Traffic splitting: During a rollout, traffic is gradually shifted from the old version to the new version. Operators configure the split ratio (for example 10/90, then 50/50, then 100/0) and advance the rollout in stages.

2. LoRA adapter rollouts: New LoRA adapters can be deployed incrementally. A small percentage of traffic is routed to replicas serving the new adapter while the majority continues using the current adapter. This enables testing with real production traffic before full deployment.

3. Base model rollouts: When upgrading to a new base model version, the rollout mechanism allows side-by-side comparison under production load. Metrics from both versions are collected for regression detection.

4. Model server version rollouts: When upgrading vLLM or SGLang versions, the rollout mechanism ensures the new version performs correctly before full rollover.

5. Regression monitoring: During a rollout, operators monitor key metrics (latency, throughput, error rate, cache hit rate) on both the old and new versions. If regressions are detected, the rollout can be paused or rolled back.

6. Gradual deployment: The rollout proceeds through configurable stages, with health checks and metric validation at each stage before advancing to the next split ratio.`,
  },
  {
    topic: 'Precise Prefix Cache',
    keywords: [
      'precise prefix cache', 'event-driven', 'zmq', 'zeromq', 'kv-cache indexing',
      'block-level scoring', 'heuristic', 'exact scoring', 'vllm kv-cache events',
      'block hash', 'dual-key', 'prefix scoring', 'cache index',
    ],
    content: `The Precise Prefix Cache is a well-lit path that upgrades llm-d's cache-aware routing from heuristic estimation to exact block-level scoring.

How it works:

1. Event-driven KV-cache indexing: Instead of estimating which prefixes are cached on each worker, the precise prefix cache uses event-driven tracking. When vLLM computes and stores KV cache blocks, it publishes events over ZMQ (ZeroMQ) messaging. The EPP subscribes to these events and maintains an exact, real-time index of which blocks reside on which worker.

2. Block hash dual-key design: Each KV cache block is identified by a dual-key hash that captures both the token content and the model layer position. This enables precise matching - the router knows exactly which blocks of a request's prefix are already cached, down to the individual block level.

3. Exact block-level scoring: When a new request arrives, the EPP computes block hashes for the request's prefix and looks them up in the global index. The score for each worker reflects the exact number of matching blocks, not a heuristic estimate. This produces more accurate routing decisions.

4. Improvement over heuristic scoring: The default prefix-cache-scorer uses heuristic estimation based on prefix length matching. The precise prefix cache replaces this with exact block-level matching, which is particularly beneficial for multi-turn conversational workloads where prefix overlap patterns are complex.

5. vLLM KV-cache events: The system relies on patched vLLM that emits cache lifecycle events (block allocation, eviction, migration) over a ZMQ pub/sub channel. The EPP consumes these events to keep its global index current with minimal latency.`,
  },
  {
    topic: 'SGLang Support',
    keywords: [
      'sglang', 'alternative', 'model server', 'backend', 'vllm alternative',
      'inference engine', 'optimized baseline', 'disaggregation',
      'sglang support', 'serving engine',
    ],
    content: `SGLang is supported as an alternative model server backend alongside vLLM in llm-d.

Key points:

1. Dual backend support: llm-d is model-server-agnostic at the architecture level. The Router and EPP communicate with model servers via standard APIs, and the InferencePool abstraction hides backend differences from the routing layer. Operators can choose between vLLM and SGLang based on their workload characteristics and preferences.

2. Supported well-lit paths: SGLang is explicitly supported in the Optimized Baseline well-lit path, allowing operators to deploy the recommended baseline configuration with SGLang instead of vLLM. SGLang is also supported in the Prefill/Decode Disaggregation guide for disaggregated serving deployments.

3. SGLang optimizations: SGLang provides its own set of inference optimizations including RadixAttention for efficient prefix caching, constrained decoding, and optimized batch scheduling. These complement llm-d's routing and orchestration capabilities.

4. Configuration: Switching between vLLM and SGLang requires updating the model server image and any server-specific flags in the InferencePool configuration. The router and EPP configuration remain unchanged because both backends expose OpenAI-compatible APIs.

5. Compatibility: Both vLLM and SGLang can run in the same cluster on different InferencePools, enabling operators to use different backends for different models or workloads.`,
  },
]
