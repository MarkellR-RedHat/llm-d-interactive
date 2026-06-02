import { useState, useRef, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/shared/PageTransition'
import Term from '../components/shared/Term'
import Expand from '../components/shared/Expand'
import InteractiveFlow from '../components/shared/InteractiveFlow'

/* ─── Helper Components ─── */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: '56px' }}>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 700,
          color: '#151515',
          marginBottom: '20px',
          lineHeight: '36px',
        }}
      >
        {title}
      </h3>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '18px',
          lineHeight: '32px',
          color: '#212121',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function KeyConcept({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: '#F0F0F0',
        padding: '20px 24px',
        marginBottom: '16px',
        borderRadius: '4px',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: '18px',
          color: '#151515',
        }}
      >
        {term}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '18px',
          lineHeight: '32px',
          color: '#212121',
          marginLeft: '8px',
        }}
      >
        {children}
      </span>
    </div>
  )
}

function ComparisonTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: string[][]
}) {
  return (
    <div style={{ overflowX: 'auto', margin: '24px 0' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'var(--font-body)',
          fontSize: '15px',
          lineHeight: '24px',
        }}
      >
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  backgroundColor: '#151515',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '14px',
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #E0E0E0',
                    backgroundColor: ri % 2 === 0 ? '#fff' : '#F0F0F0',
                    color: '#212121',
                    verticalAlign: 'top',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MonoDiagram({ lines }: { lines: string[] }) {
  return (
    <pre
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        lineHeight: '22px',
        backgroundColor: '#151515',
        color: '#D2D2D2',
        padding: '28px 24px',
        overflowX: 'auto',
        borderRadius: '4px',
        margin: '24px 0',
      }}
    >
      {lines.join('\n')}
    </pre>
  )
}

/* ─── Tab Content ─── */

function BasicsTab() {
  return (
    <div>
      <Section title="What does llm&#x2011;d do?">
        <p style={{ marginBottom: '20px' }}>
          Think of a busy restaurant. You could have one chef doing everything:
          taking orders, prepping ingredients, cooking every dish, plating, and
          cleaning up. That works for a small cafe, but it collapses under pressure.
        </p>
        <p style={{ marginBottom: '20px' }}>
          Now imagine a professional kitchen. A host routes incoming orders to the
          right station. One cook specializes in prep work. Another handles the grill.
          They share a common pantry so ingredients prepped once can be reused.
          Each station scales independently based on demand.
        </p>
        <p style={{ marginBottom: '20px' }}>
          That is what llm&#x2011;d does for large language model{' '}
          <Term definition="The process of sending input to a trained model and getting an answer back. It is the 'running' phase, as opposed to the 'training' phase.">inference</Term>.
          Instead of running everything on a single{' '}
          <Term definition="Graphics Processing Unit. A specialized processor originally designed for rendering graphics, now widely used for the massive parallel math that powers AI models.">GPU</Term>{' '}
          (or a single process), it splits the work into specialized pieces that can
          each scale on their own. A router directs requests.{' '}
          <Term definition="The first phase of inference, where the model processes all of the input tokens at once. This is the compute-heavy step.">Prefill</Term>{' '}
          workers handle the compute-heavy initial processing.{' '}
          <Term definition="The second phase of inference, where the model generates output tokens one at a time. This is the memory-bandwidth-heavy step.">Decode</Term>{' '}
          workers generate tokens one at a time. And a shared{' '}
          <Term definition="Key-Value cache. A memory store that saves the intermediate computations (attention keys and values) from previous tokens so the model does not have to redo that work.">KV cache</Term>{' '}
          acts as the pantry, storing previous work so it can be reused across requests.
        </p>
        <Expand label="What exactly is a language model?">
          <p style={{ marginBottom: '16px' }}>
            A large language model (LLM) is a neural network trained on vast amounts of
            text. At its core is an architecture called a <strong>transformer</strong>,
            which uses a mechanism called <strong>attention</strong> to figure out how
            every word (or sub-word piece, called a <strong>token</strong>) relates to
            every other word in the input.
          </p>
          <p style={{ marginBottom: '16px' }}>
            When you send a prompt to the model, the text is first split into tokens.
            The model then runs those tokens through dozens (or hundreds) of layers,
            each containing attention and feed-forward computations. The output is a
            probability distribution over the next token, which is sampled to produce
            the response one token at a time.
          </p>
          <p>
            The "large" in LLM refers to the number of parameters, which can range from
            a few billion to hundreds of billions. More parameters generally mean better
            quality, but also more memory and compute to run.
          </p>
        </Expand>
      </Section>

      <Section title="The key ideas">
        <p style={{ marginBottom: '16px' }}>
          Here is the basic flow of a request through llm&#x2011;d:
        </p>
        <InteractiveFlow
          steps={[
            {
              title: 'A request arrives from a user or application',
              detail:
                'The request is an HTTP call to an OpenAI-compatible API endpoint. It contains the prompt text, model parameters (temperature, max tokens), and optionally a conversation history.',
            },
            {
              title: 'The router selects the best worker',
              detail:
                'The router examines cache state, current load, and predicted latency across all available workers. It picks the worker most likely to serve this request quickly, for example one that already has a matching prefix cached in memory.',
            },
            {
              title: 'A prefill worker processes the input prompt',
              detail:
                'The prefill worker takes every input token and runs it through the model layers in parallel. This is the most compute-intensive step, performing dense matrix multiplications to build the internal representation of your prompt.',
            },
            {
              title: 'The KV cache stores the computed state',
              detail:
                'The attention keys and values computed during prefill are saved to the cache. If a future request shares the same prefix (a common system prompt, for example), this work can be skipped entirely, saving significant GPU time.',
            },
            {
              title: 'A decode worker generates the response',
              detail:
                'The decode worker produces output tokens one at a time, reading from the KV cache at each step. Each new token is streamed back to the caller immediately, so the user sees the response appear progressively rather than waiting for the entire answer.',
            },
          ]}
        />
      </Section>

      <Section title="Why does this matter?">
        <p style={{ marginBottom: '20px' }}>
          Large language models are expensive to run. A single high-end{' '}
          <Term definition="Graphics Processing Unit. A specialized processor originally designed for rendering graphics, now widely used for the massive parallel math that powers AI models.">GPU</Term>{' '}
          can cost thousands of dollars per month. When that GPU sits idle waiting
          for one part of the pipeline to finish, or when it re-computes work it
          has already done for a previous request, that is wasted money.
        </p>
        <p style={{ marginBottom: '20px' }}>
          llm&#x2011;d addresses this directly. By disaggregating{' '}
          <Term definition="The process of sending input to a trained model and getting an answer back. It is the 'running' phase, as opposed to the 'training' phase.">inference</Term>{' '}
          into{' '}
          <Term definition="The first phase of inference, where the model processes all of the input tokens at once. This is the compute-heavy step.">prefill</Term>{' '}
          and{' '}
          <Term definition="The second phase of inference, where the model generates output tokens one at a time. This is the memory-bandwidth-heavy step.">decode</Term>{' '}
          stages, each can be placed on hardware matched to its workload profile. By
          sharing a{' '}
          <Term definition="Key-Value cache. A memory store that saves the intermediate computations (attention keys and values) from previous tokens so the model does not have to redo that work.">KV cache</Term>{' '}
          across workers, repeated prompts (system prompts, common prefixes,
          multi-turn conversations) avoid redundant computation. By using intelligent
          routing, requests land on the worker best positioned to serve them quickly.
        </p>
        <p style={{ marginBottom: '20px' }}>
          The whole system runs on{' '}
          <Term definition="An open source container orchestration platform that automates deploying, scaling, and managing containerized applications across clusters of machines.">Kubernetes</Term>,
          so it integrates with the infrastructure teams already use in production.
        </p>
        <p>
          The result: higher throughput, lower latency, and better GPU utilization,
          all without changing the model or the API your application already uses.
        </p>
      </Section>
    </div>
  )
}

function BeginnerTab() {
  return (
    <div>
      <Section title="What is LLM serving?">
        <p style={{ marginBottom: '20px' }}>
          LLM serving is the infrastructure that sits between a trained model and
          the applications that use it. It handles loading the model onto{' '}
          <Term definition="Graphics Processing Unit. A specialized processor designed for parallel computation, now the primary hardware used to run AI models.">GPUs</Term>,
          accepting API requests, managing batching, and streaming results back.
        </p>
        <p style={{ marginBottom: '20px' }}>
          Most serving frameworks (<Term definition="An open source, high-throughput model serving engine. It implements PagedAttention for efficient memory management and supports continuous batching.">vLLM</Term>,
          TGI, Triton) handle single-node or basic multi-node setups well.
          llm&#x2011;d adds distributed orchestration on top of{' '}
          <Term definition="An open source, high-throughput model serving engine. It implements PagedAttention for efficient memory management and supports continuous batching.">vLLM</Term>,
          turning a cluster of GPU nodes into a coordinated serving system with
          intelligent routing, shared caching, and independent scaling of each
          component.
        </p>
      </Section>

      <Section title="Core components">
        <KeyConcept term="Router">
          The entry point for all requests. It implements multiple routing policies:
          prefix-cache-aware routing, load-aware routing, and predicted-latency
          routing. Built from two subcomponents: the Endpoint Picker (which selects
          the best worker) and the Proxy (which forwards the request).
        </KeyConcept>
        <KeyConcept term="Prefill Workers">
          Handle the compute-intensive first phase of{' '}
          <Term definition="The process of running a trained model to generate predictions or responses from input data.">inference</Term>.
          They process the entire input prompt at once, computing attention across
          all input{' '}
          <Term definition="A word or sub-word unit that the model processes. Text is split into tokens before being fed to the model. For example, the word 'unhappiness' might become three tokens: 'un', 'happi', 'ness'.">tokens</Term>.
          This is a compute-bound workload that benefits from high{' '}
          <Term definition="Floating Point Operations Per Second. A measure of how fast a processor can perform mathematical calculations.">FLOPS</Term>{' '}
          hardware.
        </KeyConcept>
        <KeyConcept term="Decode Workers">
          Handle the memory-bandwidth-intensive second phase. They generate output{' '}
          <Term definition="A word or sub-word unit that the model processes. Text is split into tokens before being fed to the model. For example, the word 'unhappiness' might become three tokens: 'un', 'happi', 'ness'.">tokens</Term>{' '}
          one at a time, reading from the{' '}
          <Term definition="Key-Value cache. Stores the attention keys and values computed during inference so they can be reused for subsequent tokens instead of being recomputed.">KV cache</Term>{' '}
          at each step. This workload is bound by memory bandwidth rather than raw
          compute.
        </KeyConcept>
        <KeyConcept term="KV Cache">
          A hierarchical storage system spanning GPU HBM, CPU DRAM, and disk. A
          global index tracks which prefixes exist across the entire cluster,
          enabling cache-aware routing decisions. Previously computed KV states
          can be reused by any worker that needs them.
        </KeyConcept>
        <KeyConcept term="Autoscaler">
          <Term definition="Automatically adding or removing worker instances in response to changes in demand, so resources are neither wasted nor overwhelmed.">Autoscaling</Term>{' '}
          for{' '}
          <Term definition="The first phase of inference, where the model processes all of the input tokens at once.">prefill</Term>{' '}
          and{' '}
          <Term definition="The second phase of inference, where the model generates output tokens one at a time.">decode</Term>{' '}
          worker pools independently based on{' '}
          <Term definition="Service Level Objective. A measurable target for system performance, such as 'p99 time-to-first-token under 500ms'.">SLO</Term>{' '}
          targets and inference-specific signals. Supports scale-to-zero for cost
          optimization when models are idle.
        </KeyConcept>
        <Expand label="How do prefill and decode differ at the hardware level?">
          <p style={{ marginBottom: '16px' }}>
            <strong><Term definition="The first phase of inference, where the model processes all of the input tokens at once.">Prefill</Term></strong>{' '}
            is compute-bound. It performs dense matrix multiplications over every
            input token simultaneously. The bottleneck is how many floating-point
            operations the GPU can execute per second. High-FLOPS accelerators (like
            NVIDIA B200) excel here.
          </p>
          <p>
            <strong><Term definition="The second phase of inference, where the model generates output tokens one at a time.">Decode</Term></strong>{' '}
            is memory-bandwidth-bound. For each new token, the model must read the
            entire{' '}
            <Term definition="Key-Value cache. Stores the attention keys and values computed during inference so they can be reused for subsequent tokens instead of being recomputed.">KV cache</Term>{' '}
            from GPU memory. The bottleneck is how fast data can be read from
            memory, not how fast the GPU can compute. GPUs with higher memory
            bandwidth (measured in TB/s) produce tokens faster.
          </p>
        </Expand>
      </Section>

      <Section title="How a request flows">
        <InteractiveFlow
          steps={[
            {
              title: 'Client sends a prompt via the OpenAI-compatible API',
              detail:
                'The request uses the same format as OpenAI\'s chat completions endpoint, so existing applications can switch to llm‑d without code changes. The body includes the messages array, model name, and generation parameters.',
            },
            {
              title: 'Router checks the global KV cache index for matching prefixes',
              detail:
                'The router maintains an index of which prefixes are cached on which workers. A prefix is a sequence of tokens that matches the start of the incoming prompt, such as a system prompt shared across many requests.',
            },
            {
              title: 'Endpoint Picker selects the best worker',
              detail:
                'Based on the active routing policy (cache hit, current load, or predicted latency), the Endpoint Picker chooses the worker most likely to serve this request quickly and forwards it via the Proxy.',
            },
            {
              title: 'Prefill worker processes all input tokens',
              detail:
                'The prefill worker runs every input token through the model\'s attention layers in parallel. This step computes the internal representations the model needs to begin generating a response.',
            },
            {
              title: 'Computed KV state is stored and indexed for reuse',
              detail:
                'The attention keys and values are written to the hierarchical cache and registered in the global index. Any future request with a matching prefix can skip this computation entirely.',
            },
            {
              title: 'Decode worker generates output tokens one at a time',
              detail:
                'The decode worker reads from the KV cache at each step and produces one new token. Each token is sampled from a probability distribution, and the process repeats until the model produces a stop token or hits the maximum length.',
            },
            {
              title: 'Response streams back to the client via SSE',
              detail:
                'Server-Sent Events deliver each token to the client as soon as it is generated. The user sees the response appear word by word rather than waiting for the entire answer to finish.',
            },
          ]}
        />
      </Section>

      <Section title="vLLM alone vs. vLLM + llm&#x2011;d">
        <ComparisonTable
          headers={['Capability', 'vLLM Alone', 'vLLM + llm‑d']}
          rows={[
            [
              'Routing',
              'Round-robin or random',
              'Prefix-cache-aware, load-aware, predicted-latency',
            ],
            [
              'KV Cache',
              'Local to each instance',
              'Hierarchical (GPU/CPU/disk) with global index',
            ],
            [
              'Scaling',
              'Manual replica count',
              'SLO-aware autoscaling, scale-to-zero',
            ],
            [
              'Prefill / Decode split',
              'Combined on same GPU',
              'Disaggregated, independently scalable',
            ],
            [
              'Multi-tenant',
              'Separate deployments',
              'Shared cluster with LoRA-aware routing',
            ],
            [
              'Deployment',
              'Single process or basic TP',
              'Kubernetes-native with Helm charts and operators',
            ],
          ]}
        />
        <Expand label="When should I use llm&#x2011;d vs. plain vLLM?">
          <p style={{ marginBottom: '16px' }}>
            <strong>Use plain <Term definition="An open source, high-throughput model serving engine. It implements PagedAttention for efficient memory management and supports continuous batching.">vLLM</Term></strong>{' '}
            when you have a single GPU or a small number of GPUs, low request volume,
            and a single model to serve. vLLM handles batching and memory management
            well on its own.
          </p>
          <p style={{ marginBottom: '16px' }}>
            <strong>Use llm&#x2011;d</strong> when you need to serve at scale across
            many GPUs, want cache-aware routing to avoid redundant computation,
            need independent scaling of{' '}
            <Term definition="The first phase of inference, where the model processes all of the input tokens at once.">prefill</Term>{' '}
            and{' '}
            <Term definition="The second phase of inference, where the model generates output tokens one at a time.">decode</Term>,
            or are running multiple models/
            <Term definition="Low-Rank Adaptation. A lightweight fine-tuning method that trains a small set of additional parameters instead of modifying the full model weights.">LoRA</Term>{' '}
            adapters on shared infrastructure.
          </p>
          <p>
            The deployment path uses{' '}
            <Term definition="An open source container orchestration platform that automates deploying, scaling, and managing containerized applications across clusters of machines.">Kubernetes</Term>{' '}
            with{' '}
            <Term definition="A package manager for Kubernetes that bundles configuration files into reusable 'charts' for easy deployment.">Helm</Term>{' '}
            charts or{' '}
            <Term definition="A Kubernetes-native configuration customization tool that lets you patch and overlay YAML manifests without modifying the originals.">kustomize</Term>{' '}
            overlays, so it fits into existing cluster workflows.
          </p>
        </Expand>
      </Section>
    </div>
  )
}

function IntermediateTab() {
  return (
    <div>
      <Section title="Disaggregated inference in depth">
        <p style={{ marginBottom: '20px' }}>
          Prefill and decode have fundamentally different hardware requirements.
          Prefill processes the entire input sequence at once, performing dense
          matrix multiplications across all tokens. This is compute-bound: more{' '}
          <Term definition="Floating Point Operations Per Second. A measure of raw computational throughput, typically quoted in teraFLOPS (TFLOPS) for modern GPUs.">FLOPS</Term>{' '}
          means faster prefill. Decode generates one token at a time, reading the
          full KV cache at each step. This is memory-bandwidth-bound: faster memory
          access means faster decode.
        </p>
        <p style={{ marginBottom: '20px' }}>
          When both phases share the same GPU, they contend for resources. A long
          prefill blocks decode, increasing inter-token latency for in-flight
          requests. A decode-heavy load leaves compute underutilized during prefill.
        </p>
        <p style={{ marginBottom: '20px' }}>
          llm&#x2011;d deploys prefill and decode as separate Kubernetes workloads
          (StatefulSets), each with its own scaling policy and hardware allocation.
          This eliminates contention and lets operators right-size each pool.
        </p>
        <KeyConcept term="Validated topology">
          16 prefill + 16 decode B200 GPUs sustaining over 50,000 output tokens
          per second. This configuration demonstrates near-linear scaling with
          disaggregated pools.
        </KeyConcept>
        <Expand label="What if my GPUs are all the same type?">
          <p style={{ marginBottom: '16px' }}>
            Disaggregation still helps even with homogeneous hardware. The benefit
            is not just about matching different GPU types to different workloads.
            It is also about eliminating contention.
          </p>
          <p style={{ marginBottom: '16px' }}>
            When prefill and decode share a GPU, a long prefill (from a large
            prompt) blocks the decode loop for all in-flight requests on that GPU.
            This causes latency spikes for users who are mid-response. With
            disaggregation, decode workers are never interrupted by incoming
            prefill work.
          </p>
          <p>
            Additionally, you can scale each pool independently. During peak hours,
            you might need more prefill workers to absorb a burst of new requests
            while decode demand stays steady. With a combined setup, you would have
            to scale everything together, wasting resources.
          </p>
        </Expand>
      </Section>

      <Section title="Routing policies explained">
        <KeyConcept term="Prefix-cache-aware routing">
          Directs requests to workers that already have matching KV cache entries
          for the prompt prefix. By reusing cached state instead of re-computing it,
          this policy achieves approximately 3x throughput improvement and 2x
          time-to-first-token reduction compared to{' '}
          <Term definition="A simple load-balancing strategy that distributes requests evenly to each server in turn, without considering cache state or current load.">round-robin</Term>{' '}
          routing.
        </KeyConcept>
        <KeyConcept term="Load-aware routing">
          Monitors queue depth and utilization across workers, steering new requests
          to the least loaded instance. This prevents hot spots and smooths tail
          latencies across the cluster.
        </KeyConcept>
        <KeyConcept term="Predicted-latency routing">
          Uses an{' '}
          <Term definition="A gradient-boosted decision tree algorithm commonly used for tabular prediction tasks. Here it is trained to predict request latency from features like token count, cache hit ratio, and queue depth.">XGBoost</Term>{' '}
          model trained on request characteristics (token count, cache hit ratio,
          current queue state) to predict per-worker latency for each incoming
          request. Routes to the worker with the lowest predicted completion time.
          In benchmarks, this achieves approximately 40% reduction in both
          time-to-first-token and inter-token latency. Supports{' '}
          <Term definition="HTTP headers attached to a request that specify per-request latency targets, allowing the router to make routing decisions that respect the caller's specific performance requirements.">SLO headers</Term>{' '}
          for per-request latency targets.
        </KeyConcept>
        <KeyConcept term="Cache-aware LoRA routing">
          For multi-tenant deployments using{' '}
          <Term definition="Low-Rank Adaptation. A lightweight fine-tuning method that trains a small set of additional parameters (adapters) instead of modifying the full model weights. Multiple LoRA adapters can share a single base model.">LoRA</Term>{' '}
          adapters, this policy routes requests to workers that already have the
          required adapter loaded, avoiding adapter swap overhead.
        </KeyConcept>
      </Section>

      <Section title="KV cache hierarchy">
        <p style={{ marginBottom: '20px' }}>
          The KV cache in llm&#x2011;d is organized into three tiers, each trading
          off speed for capacity:
        </p>
        <InteractiveFlow
          steps={[
            {
              title: 'Tier 1: GPU HBM',
              detail:
                'HBM (High-Bandwidth Memory) is memory stacked directly on the GPU die, delivering terabytes per second of bandwidth. Capacity is limited to tens of GB per device. Hot prefixes and in-flight request state live here. This is the fastest tier, but entries are evicted first when memory pressure rises.',
            },
            {
              title: 'Tier 2: CPU DRAM',
              detail:
                'DRAM (Dynamic Random Access Memory) is the system RAM on the host machine. It offers hundreds of GB per node at moderate bandwidth. Warm prefixes evicted from GPU memory are held here, avoiding a full recompute on cache miss. Restoring from DRAM is much faster than rerunning prefill.',
            },
            {
              title: 'Tier 3: Disk / NVMe',
              detail:
                'NVMe (Non-Volatile Memory Express) solid-state drives provide terabytes of capacity at the lowest bandwidth tier. Cold prefixes and long-lived conversational state are persisted here for retrieval when sessions resume after being idle. This tier is crucial for multi-turn conversations that span hours or days.',
            },
          ]}
        />
        <p style={{ marginTop: '20px', marginBottom: '20px' }}>
          A global index tracks which prefixes reside on which tier and which node,
          enabling the router to make cache-aware decisions across the entire cluster.
        </p>
        <KeyConcept term="Benchmark">
          On a 4x H100 cluster with 250 concurrent users, the hierarchical cache
          achieves 13.9x throughput compared to a GPU-only cache baseline,
          because evicted prefixes can be restored from CPU or disk rather than
          recomputed from scratch.
        </KeyConcept>
      </Section>

      <Section title="Supported hardware">
        <ComparisonTable
          headers={['Vendor', 'Accelerators', 'Notes']}
          rows={[
            ['NVIDIA', 'H100, H200, B200', 'Primary development and benchmark platform'],
            ['AMD', 'MI300X', 'Supported via ROCm-compatible vLLM backend'],
            ['Intel', 'XPU, Gaudi', 'Supported for inference workloads'],
            ['Google', 'TPU', 'Supported for Cloud TPU deployments'],
          ]}
        />
      </Section>
    </div>
  )
}

function AdvancedTab() {
  return (
    <div>
      <Section title="Production deployment topology">
        <p style={{ marginBottom: '16px' }}>
          A production llm&#x2011;d deployment on Kubernetes consists of several
          coordinated resources:
        </p>
        <MonoDiagram
          lines={[
            '                  +---------------------+',
            '                  |   Ingress / LB      |',
            '                  +----------+----------+',
            '                             |',
            '                  +----------v----------+',
            '                  |   Router Deployment  |',
            '                  |   (Endpoint Picker   |',
            '                  |    + Proxy, 2+ pods) |',
            '                  +----+------------+----+',
            '                       |            |',
            '            +----------v---+  +-----v-----------+',
            '            |  Prefill     |  |  Decode          |',
            '            |  StatefulSet |  |  StatefulSet     |',
            '            |  (N pods,    |  |  (M pods,        |',
            '            |   compute-   |  |   bandwidth-     |',
            '            |   optimized) |  |   optimized)     |',
            '            +------+-------+  +--------+---------+',
            '                   |                    |',
            '            +------v--------------------v---------+',
            '            |      KV Cache Layer                  |',
            '            |  +--------+ +--------+ +---------+  |',
            '            |  |GPU HBM | |CPU DRAM| |Disk/NVMe|  |',
            '            |  +--------+ +--------+ +---------+  |',
            '            |      Global Prefix Index             |',
            '            +-----------------------+--------------+',
            '                                    |',
            '            +-----------------------v--------------+',
            '            |  Autoscaler                           |',
            '            |  (SLO-aware, per-pool scaling,        |',
            '            |   scale-to-zero capable)              |',
            '            +--------------------------------------+',
            '',
            '  ConfigMaps: model config, routing policy, SLO targets',
            '  Secrets: model registry credentials, TLS certs',
          ]}
        />
        <p style={{ marginBottom: '20px' }}>
          The router runs as a standard Deployment (stateless, horizontally scalable).
          Prefill and decode pools run as{' '}
          <Term definition="A Kubernetes workload resource designed for applications that need stable network identities and persistent storage. Each pod gets a unique, stable hostname (e.g. prefill-0, prefill-1) that survives restarts.">StatefulSets</Term>{' '}
          with persistent volume claims for local model caching. The autoscaler
          watches latency metrics from the router and adjusts replica counts per pool.
        </p>
        <p>
          Configuration is stored in{' '}
          <Term definition="A Kubernetes object that stores non-confidential configuration data as key-value pairs. Pods can consume ConfigMaps as environment variables, command-line arguments, or mounted files.">ConfigMaps</Term>{' '}
          (model config, routing policy, SLO targets) and Secrets (model registry
          credentials, TLS certs). A{' '}
          <Term definition="A Kubernetes controller that ensures a copy of a specific pod runs on every node (or a selected subset of nodes) in the cluster. Useful for node-level agents like log collectors or monitoring daemons.">DaemonSet</Term>{' '}
          can optionally run a monitoring agent on each node for fine-grained
          hardware telemetry.
        </p>
      </Section>

      <Section title="Autoscaling strategies">
        <KeyConcept term="SLO-aware scaling">
          The autoscaler monitors time-to-first-token and inter-token latency against
          configurable targets. When latency exceeds the SLO threshold, it scales up
          the bottleneck pool (prefill or decode) independently. When latency is well
          under target, it scales down to reduce cost. Scaling decisions use
          inference-specific signals (queue depth, batch utilization, cache hit rate)
          rather than generic CPU/memory metrics.
        </KeyConcept>
        <KeyConcept term="Workload-variant scaling">
          For clusters serving multiple models, the autoscaler can optimize across
          model pools to minimize total cost while meeting per-model SLOs. If one
          model is idle while another is under pressure, resources can be reallocated.
        </KeyConcept>
        <KeyConcept term="Scale-to-zero">
          Models with intermittent traffic can scale to zero replicas when idle.
          On the next request, the autoscaler provisions workers, loads the model,
          and serves the request.{' '}
          <Term definition="The delay experienced when a service scales from zero replicas to one. The system must allocate a GPU, load model weights into memory, and warm up before serving the first request.">Cold start</Term>{' '}
          time depends on model size and storage backend. This is particularly
          useful for development, staging, and low-traffic{' '}
          <Term definition="Low-Rank Adaptation. A lightweight fine-tuning method that trains a small set of additional parameters instead of modifying the full model weights.">LoRA</Term>{' '}
          adapters.
        </KeyConcept>
        <Expand label="How does the workload-variant autoscaler choose between model variants?">
          <p style={{ marginBottom: '16px' }}>
            The workload-variant autoscaler solves a constrained optimization problem.
            It takes as input the current per-model SLO targets, the observed latency
            and throughput for each model, and the available GPU resources across the
            cluster.
          </p>
          <p style={{ marginBottom: '16px' }}>
            When demand for one model drops, the autoscaler checks whether releasing
            those GPUs and reassigning them to an overloaded model pool would lower
            overall cost while still meeting all SLO targets. On heterogeneous
            hardware, it also considers which GPU type best matches each model's
            workload profile (compute-heavy models on high-FLOPS GPUs, bandwidth-heavy
            decode on high-bandwidth GPUs).
          </p>
          <p>
            The result is a dynamic allocation that continuously rebalances across
            models, rather than requiring operators to manually partition GPU resources
            per model.
          </p>
        </Expand>
      </Section>

      <Section title="Performance benchmarks">
        <p style={{ marginBottom: '16px' }}>
          Published benchmark results from llm&#x2011;d testing:
        </p>
        <ComparisonTable
          headers={['Configuration', 'Metric', 'Result']}
          rows={[
            ['16x16 B200 (P/D split)', 'Output throughput', '> 50,000 tok/s'],
            ['Prefix-cache-aware routing', 'Throughput vs. round-robin', '~3x improvement'],
            ['Prefix-cache-aware routing', 'TTFT vs. round-robin', '~2x reduction'],
            ['Predicted-latency routing', 'TTFT reduction', '~40% lower'],
            ['Predicted-latency routing', 'ITL reduction', '~40% lower'],
            ['4x H100, hierarchical cache', 'Throughput at 250 users (vs. GPU-only)', '13.9x'],
            ['B200, DeepSeek (MoE)', 'Per-GPU throughput', '~3,100 tok/s/GPU'],
          ]}
        />
        <Expand label="How were these benchmarks measured?">
          <p style={{ marginBottom: '16px' }}>
            Throughput benchmarks use a sustained load test that sends requests at
            increasing rates until the system reaches saturation. The reported
            throughput is the maximum rate at which all requests complete within
            the configured SLO window.
          </p>
          <p style={{ marginBottom: '16px' }}>
            Latency benchmarks (TTFT and ITL reductions) compare routing policies
            against a round-robin baseline under identical hardware, model, and load
            conditions. The workload mix uses representative prompt lengths and output
            lengths drawn from production traffic distributions.
          </p>
          <p>
            The hierarchical cache benchmark (13.9x) measures sustained throughput
            at 250 concurrent users over a 30-minute window. The baseline uses only
            GPU-resident KV cache with no CPU or disk tiers. Both runs use identical
            hardware and prompt distributions.
          </p>
        </Expand>
      </Section>

      <Section title="Mixture-of-Experts support">
        <p style={{ marginBottom: '20px' }}>
          Large{' '}
          <Term definition="Mixture of Experts. A model architecture where only a subset of the model's parameters (called 'experts') activate for each token. This allows very large models to remain computationally efficient, since most experts are idle for any given input.">MoE</Term>{' '}
          models like the DeepSeek family present unique serving challenges. Only
          a subset of experts activate per token, but all expert weights must be
          resident in memory. This makes the memory footprint large relative to
          the compute actually used per forward pass.
        </p>
        <p style={{ marginBottom: '20px' }}>
          llm&#x2011;d supports wide expert-parallelism for MoE architectures,
          distributing expert weights across multiple GPUs so that each device
          holds a manageable subset. When a token activates experts on a remote
          device, the system handles the inter-GPU communication transparently.
        </p>
        <KeyConcept term="DeepSeek on B200">
          Approximately 3,100 output tokens per second per GPU on NVIDIA B200
          hardware using wide expert-parallelism. This enables serving very large
          MoE models at production throughput levels.
        </KeyConcept>
      </Section>

      <Section title="Transport and high availability">
        <KeyConcept term="UCCL transport">
          llm&#x2011;d integrates with{' '}
          <Term definition="Unified Collective Communication Library. A high-performance communication library that optimizes collective operations (all-reduce, all-gather) across GPU interconnects for multi-node inference.">UCCL</Term>{' '}
          for high-performance inter-node communication during tensor-parallel and
          expert-parallel inference. It optimizes collective operations across GPU
          interconnects, including{' '}
          <Term definition="A high-speed networking technology commonly used in HPC and AI clusters. InfiniBand provides very low latency and high bandwidth for inter-node GPU communication.">InfiniBand</Term>{' '}
          and{' '}
          <Term definition="RDMA over Converged Ethernet. A protocol that enables remote direct memory access over standard Ethernet networks, providing InfiniBand-like performance without specialized networking hardware.">RoCE RDMA</Term>{' '}
          fabrics, minimizing communication overhead in multi-node deployments.
        </KeyConcept>
        <KeyConcept term="Active-active router HA">
          The router supports{' '}
          <Term definition="A high-availability configuration where all instances actively serve traffic simultaneously, rather than having a standby instance waiting to take over on failure.">active-active HA</Term>.
          Multiple router replicas run concurrently behind a load balancer, each
          maintaining an up-to-date view of worker health and cache state. If a
          router instance fails, traffic is seamlessly handled by the remaining
          replicas with no request loss or cache index staleness.
        </KeyConcept>
      </Section>
    </div>
  )
}

/* ─── Tab Configuration ─── */

const tabs = [
  { id: 'basics', label: 'The Basics' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
] as const

type TabId = (typeof tabs)[number]['id']

const tabContent: Record<TabId, () => React.JSX.Element> = {
  basics: BasicsTab,
  beginner: BeginnerTab,
  intermediate: IntermediateTab,
  advanced: AdvancedTab,
}

/* ─── Main Page ─── */

export default function Learn() {
  const [activeTab, setActiveTab] = useState<TabId>('basics')
  const [isSticky, setIsSticky] = useState(false)
  const tabBarRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const ActiveContent = tabContent[activeTab]

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
        {/* Header */}
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
                backgroundColor: '#EE0000',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '24px',
              }}
            >
              Learning Center
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: 300,
                lineHeight: '110%',
                letterSpacing: '-0.02em',
                color: '#151515',
                marginBottom: '20px',
                maxWidth: '800px',
              }}
            >
              What is <span style={{ whiteSpace: 'nowrap' }}>llm&#x2011;d</span>?
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '20px',
                lineHeight: '32px',
                color: '#4D4D4D',
                maxWidth: '640px',
              }}
            >
              From first principles to production deployment. Learn at your own
              pace, starting from wherever you are.
            </p>
          </div>
        </div>

        {/* Sentinel for IntersectionObserver (placed right above the tab bar) */}
        <div ref={sentinelRef} style={{ height: '1px', margin: 0, padding: 0 }} />

        {/* Sticky Tab Bar */}
        <div
          ref={tabBarRef}
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: '#fff',
            borderBottom: '1px solid #E0E0E0',
            boxShadow: isSticky ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            transition: 'box-shadow 0.3s ease',
          }}
        >
          <div
            style={{
              maxWidth: '1244px',
              margin: '0 auto',
              padding: '0 30px',
              display: 'flex',
              gap: '0',
              overflowX: 'auto',
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '16px 24px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: '15px',
                  color: activeTab === tab.id ? '#EE0000' : '#4D4D4D',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom:
                    activeTab === tab.id
                      ? '3px solid #EE0000'
                      : '3px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s ease, border-color 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div
          style={{
            maxWidth: '1244px',
            margin: '0 auto',
            padding: '48px 30px 80px',
          }}
        >
          <div style={{ maxWidth: '820px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <ActiveContent />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
