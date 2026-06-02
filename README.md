# llm-d Interactive Platform

The official interactive companion for [llm-d](https://github.com/llm-d/llm-d), the open source Kubernetes-native platform for serving large language models at scale.

## What's Here

**Interactive Tools**

- **Deployment Configurator**: Select your model, hardware, and workload profile. Generate complete, ready-to-apply Helm values, routing policies, autoscaling thresholds, and disaggregation settings.
- **Routing Strategy Visualizer**: Animated simulation showing how prefix-aware, load-based, session-affinity, and KV-cache-aware routing distribute requests across replicas. Toggle policies, inject traffic bursts, and simulate failures.
- **Capacity Planner**: Input your throughput and latency targets. See the GPU count, cluster topology, and estimated cost across AWS, GCP, and Azure. Drag the sliders to explore tradeoffs.

**Learning and Reference**

- **Learning Center**: Understand llm-d from first principles, starting wherever you are.
- **Architecture Explorer**: Interactive component diagram of the scheduler, router, prefill/decode workers, and KV cache. Click any component to learn how it works and what to configure.
- **Migration Guide**: Side-by-side comparison for teams moving from vLLM, TGI, or Triton.
- **Troubleshooting Decision Tree**: Start with your symptom, walk the flowchart, end with the fix.

## Development

```bash
npm install
npm run dev
```

## Building

```bash
npm run build
```

The output goes to `dist/` and is ready for static hosting.

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Recharts

## License

Apache License 2.0
