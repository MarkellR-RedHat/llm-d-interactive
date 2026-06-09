// ---------------------------------------------------------------------------
// Terminal game data for the llm-d deployment simulator
// Missions, commands, outputs, explanations, and model data
// ---------------------------------------------------------------------------

// ---- Model Info -----------------------------------------------------------

export interface ModelInfo {
  id: string
  name: string
  family: string
  params: string
  activeParams: string
  type: 'dense' | 'MoE' | 'quantized'
  precision: string
  vramFP16: string
  vramFP8: string
  downloadSize: string
  estimatedDownloadTime: string
  estimatedLoadTime: string
  tensorParallelism: string
  recommendedGPU: string
  gated: boolean
  description: string
}

export const MODEL_OPTIONS: ModelInfo[] = [
  // ---- Qwen Family ----
  {
    id: 'Qwen/Qwen3-0.6B',
    name: 'Qwen3-0.6B',
    family: 'Qwen',
    params: '0.6B',
    activeParams: '0.6B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~2 GB',
    vramFP8: '~1 GB',
    downloadSize: '1.2 GB',
    estimatedDownloadTime: '~10 seconds',
    estimatedLoadTime: '~3 seconds',
    tensorParallelism: 'TP=1',
    recommendedGPU: 'Any NVIDIA GPU (T4, L4, A10, A100, H100, H200)',
    gated: false,
    description:
      'Tiny but capable model, great for testing and learning. Fits on any GPU with room to spare.',
  },
  {
    id: 'Qwen/Qwen3-4B',
    name: 'Qwen3-4B',
    family: 'Qwen',
    params: '4B',
    activeParams: '4B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~8 GB',
    vramFP8: '~4 GB',
    downloadSize: '8 GB',
    estimatedDownloadTime: '~30 seconds',
    estimatedLoadTime: '~8 seconds',
    tensorParallelism: 'TP=1',
    recommendedGPU: 'T4 (16 GB), L4 (24 GB), or better',
    gated: false,
    description:
      'Lightweight dense model suitable for edge deployments and cost-sensitive workloads.',
  },
  {
    id: 'Qwen/Qwen3-8B',
    name: 'Qwen3-8B',
    family: 'Qwen',
    params: '8B',
    activeParams: '8B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~16 GB',
    vramFP8: '~8 GB',
    downloadSize: '16 GB',
    estimatedDownloadTime: '~1 minute',
    estimatedLoadTime: '~12 seconds',
    tensorParallelism: 'TP=1',
    recommendedGPU: 'L4 (24 GB), A10G (24 GB), or better',
    gated: false,
    description:
      'Solid general-purpose model. Strong coding and reasoning at a size that fits on a single mid-range GPU.',
  },
  {
    id: 'Qwen/Qwen3-14B',
    name: 'Qwen3-14B',
    family: 'Qwen',
    params: '14B',
    activeParams: '14B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~28 GB',
    vramFP8: '~14 GB',
    downloadSize: '28 GB',
    estimatedDownloadTime: '~2 minutes',
    estimatedLoadTime: '~20 seconds',
    tensorParallelism: 'TP=1',
    recommendedGPU: 'A10G (24 GB, tight), A100 (40/80 GB), or H100',
    gated: false,
    description:
      'Strong mid-size model with excellent reasoning. Good balance of quality and speed for production use.',
  },
  {
    id: 'Qwen/Qwen3.6-27B',
    name: 'Qwen3.6-27B',
    family: 'Qwen',
    params: '27B',
    activeParams: '27B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~54 GB',
    vramFP8: '~27 GB',
    downloadSize: '54 GB',
    estimatedDownloadTime: '~4 minutes',
    estimatedLoadTime: '~35 seconds',
    tensorParallelism: 'TP=1',
    recommendedGPU: 'A100-80GB or H100 (TP=1), or 2x A100-40GB (TP=2)',
    gated: false,
    description:
      'Latest Qwen flagship dense model. Competitive with 70B class models on hard tasks with thinking mode enabled.',
  },
  {
    id: 'Qwen/Qwen3-32B',
    name: 'Qwen3-32B',
    family: 'Qwen',
    params: '32B',
    activeParams: '32B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~64 GB',
    vramFP8: '~32 GB',
    downloadSize: '64 GB',
    estimatedDownloadTime: '~5 minutes',
    estimatedLoadTime: '~45 seconds',
    tensorParallelism: 'TP=1 (A100-80GB/H100) or TP=2 (2x A100-40GB)',
    recommendedGPU: 'A100-80GB, H100-80GB, or H200',
    gated: false,
    description:
      'llm-d official default model. High quality for demanding workloads. Apache 2.0 licensed.',
  },
  {
    id: 'Qwen/Qwen2.5-72B-Instruct',
    name: 'Qwen2.5-72B-Instruct',
    family: 'Qwen',
    params: '72B',
    activeParams: '72B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~144 GB',
    vramFP8: '~72 GB',
    downloadSize: '144 GB',
    estimatedDownloadTime: '~12 minutes',
    estimatedLoadTime: '~90 seconds',
    tensorParallelism: 'TP=2 (2x A100-80GB or 2x H100) or TP=1 at FP8 (1x H200)',
    recommendedGPU: '2x A100-80GB (TP=2), 2x H100 (TP=2), or 1x H200 at FP8',
    gated: false,
    description:
      'Flagship instruction-tuned dense model. Excellent at complex reasoning and long-form generation. Requires tensor parallelism across 2 GPUs at full precision.',
  },
  {
    id: 'Qwen/Qwen3-30B-A3B',
    name: 'Qwen3-30B-A3B',
    family: 'Qwen',
    params: '30B',
    activeParams: '3B',
    type: 'MoE',
    precision: 'BF16',
    vramFP16: '~60 GB',
    vramFP8: '~30 GB',
    downloadSize: '60 GB',
    estimatedDownloadTime: '~5 minutes',
    estimatedLoadTime: '~40 seconds',
    tensorParallelism: 'TP=1 (A100-80GB)',
    recommendedGPU: 'A100-80GB or H100',
    gated: false,
    description:
      'MoE model with only 3B active parameters per token. Fast inference despite total size due to sparse activation.',
  },
  {
    id: 'Qwen/Qwen3.5-122B-A10B',
    name: 'Qwen3.5-122B-A10B',
    family: 'Qwen',
    params: '122B',
    activeParams: '10B',
    type: 'MoE',
    precision: 'BF16',
    vramFP16: '~244 GB',
    vramFP8: '~122 GB',
    downloadSize: '244 GB',
    estimatedDownloadTime: '~20 minutes',
    estimatedLoadTime: '~3 minutes',
    tensorParallelism: 'TP=2 (2x H200) or TP=4 (4x A100-80GB)',
    recommendedGPU: '2x H200 (TP=2) or 4x A100-80GB (TP=4)',
    gated: false,
    description:
      'Large MoE model, 122B total but only 10B active per token. "122 billion parameter model" sounds impressive but actual inference quality matches ~10B dense models.',
  },
  {
    id: 'Qwen/Qwen3-235B-A22B',
    name: 'Qwen3-235B-A22B',
    family: 'Qwen',
    params: '235B',
    activeParams: '22B',
    type: 'MoE',
    precision: 'BF16',
    vramFP16: '~470 GB',
    vramFP8: '~235 GB',
    downloadSize: '470 GB',
    estimatedDownloadTime: '~40 minutes',
    estimatedLoadTime: '~5 minutes',
    tensorParallelism: 'TP=4 (4x H200) or TP=8 (8x A100-80GB)',
    recommendedGPU: '4x H200 (TP=4) or 8x A100-80GB (TP=8)',
    gated: false,
    description:
      'Largest Qwen MoE model. 22B active parameters per token with 235B total. Requires multi-node or high-GPU-count configurations.',
  },
  // ---- Llama Family ----
  {
    id: 'meta-llama/Llama-3.2-1B-Instruct',
    name: 'Llama-3.2-1B-Instruct',
    family: 'Llama',
    params: '1B',
    activeParams: '1B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~2 GB',
    vramFP8: '~1 GB',
    downloadSize: '2 GB',
    estimatedDownloadTime: '~15 seconds',
    estimatedLoadTime: '~5 seconds',
    tensorParallelism: 'TP=1',
    recommendedGPU: 'Any NVIDIA GPU',
    gated: true,
    description:
      'Smallest Llama model. Designed for on-device and edge deployment. Requires Meta approval on HuggingFace.',
  },
  {
    id: 'meta-llama/Llama-3.2-3B-Instruct',
    name: 'Llama-3.2-3B-Instruct',
    family: 'Llama',
    params: '3B',
    activeParams: '3B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~6 GB',
    vramFP8: '~3 GB',
    downloadSize: '6 GB',
    estimatedDownloadTime: '~25 seconds',
    estimatedLoadTime: '~8 seconds',
    tensorParallelism: 'TP=1',
    recommendedGPU: 'T4 (16 GB) or better',
    gated: true,
    description:
      'Compact Llama for lightweight deployment. Good for summarization and simple chat. Requires Meta approval.',
  },
  {
    id: 'meta-llama/Llama-3.1-8B-Instruct',
    name: 'Llama-3.1-8B-Instruct',
    family: 'Llama',
    params: '8B',
    activeParams: '8B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~16 GB',
    vramFP8: '~8 GB',
    downloadSize: '16 GB',
    estimatedDownloadTime: '~1 minute',
    estimatedLoadTime: '~15 seconds',
    tensorParallelism: 'TP=1',
    recommendedGPU: 'L4 (24 GB), A10G (24 GB), or better',
    gated: true,
    description:
      'The most popular open source LLM size class. 128K context window. Widely used in production for chat, coding, and general tasks.',
  },
  {
    id: 'meta-llama/Llama-3.3-70B-Instruct',
    name: 'Llama-3.3-70B-Instruct',
    family: 'Llama',
    params: '70B',
    activeParams: '70B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~140 GB',
    vramFP8: '~70 GB',
    downloadSize: '140 GB',
    estimatedDownloadTime: '~12 minutes',
    estimatedLoadTime: '~90 seconds',
    tensorParallelism: 'TP=2 (2x A100-80GB or 2x H100)',
    recommendedGPU: '2x A100-80GB (TP=2), 2x H100 (TP=2), or 1x H200 at FP8',
    gated: true,
    description:
      'Latest Llama 70B. Matches Llama 3.1 405B quality on many benchmarks at a fraction of the cost. The most credible open model for enterprise production. Requires Meta approval.',
  },
  {
    id: 'RedHatAI/Llama-3.3-70B-Instruct-FP8-dynamic',
    name: 'Llama-3.3-70B-FP8 (Red Hat AI)',
    family: 'Llama',
    params: '70B',
    activeParams: '70B',
    type: 'quantized',
    precision: 'FP8',
    vramFP16: 'N/A (quantized)',
    vramFP8: '~70 GB',
    downloadSize: '70 GB',
    estimatedDownloadTime: '~6 minutes',
    estimatedLoadTime: '~60 seconds',
    tensorParallelism: 'TP=1 (A100-80GB/H100/H200) or TP=2 for faster inference',
    recommendedGPU: '1x A100-80GB, 1x H100, or 1x H200. TP=2 for max throughput.',
    gated: false,
    description:
      'FP8-quantized Llama 3.3 from Red Hat AI. Ungated, fits on a single GPU, 2x inference throughput vs FP16, minimal quality loss. Production standard for enterprise.',
  },
  {
    id: 'nvidia/Llama-3.3-70B-Instruct-FP8',
    name: 'Llama-3.3-70B-FP8 (NVIDIA)',
    family: 'Llama',
    params: '70B',
    activeParams: '70B',
    type: 'quantized',
    precision: 'FP8',
    vramFP16: 'N/A (quantized)',
    vramFP8: '~70 GB',
    downloadSize: '70 GB',
    estimatedDownloadTime: '~6 minutes',
    estimatedLoadTime: '~60 seconds',
    tensorParallelism: 'TP=1 (A100-80GB/H100/H200)',
    recommendedGPU: '1x A100-80GB, 1x H100, or 1x H200',
    gated: false,
    description:
      'NVIDIA-quantized Llama 3.3 FP8. Optimized for TensorRT-LLM but also works with vLLM. Ungated.',
  },
  {
    id: 'meta-llama/Llama-3.1-405B-Instruct',
    name: 'Llama-3.1-405B-Instruct',
    family: 'Llama',
    params: '405B',
    activeParams: '405B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~810 GB',
    vramFP8: '~405 GB',
    downloadSize: '810 GB',
    estimatedDownloadTime: '~70 minutes',
    estimatedLoadTime: '~10 minutes',
    tensorParallelism: 'TP=8 (8x A100-80GB or 8x H100) at FP8, or TP=16 at BF16',
    recommendedGPU: '8x H100 (TP=8 at FP8) or 8x H200. Multi-node for BF16.',
    gated: true,
    description:
      'Largest open dense model from Meta. Frontier-class quality. Requires a full 8-GPU node at FP8 or multi-node at full precision.',
  },
  // ---- Mistral/Mixtral Family ----
  {
    id: 'mistralai/Mistral-7B-Instruct-v0.3',
    name: 'Mistral-7B-Instruct-v0.3',
    family: 'Mistral',
    params: '7B',
    activeParams: '7B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~14 GB',
    vramFP8: '~7 GB',
    downloadSize: '14 GB',
    estimatedDownloadTime: '~1 minute',
    estimatedLoadTime: '~12 seconds',
    tensorParallelism: 'TP=1',
    recommendedGPU: 'T4 (16 GB), L4 (24 GB), or better',
    gated: false,
    description:
      'Efficient 7B model with sliding window attention. Apache 2.0 licensed. Popular for cost-effective production deployments.',
  },
  {
    id: 'mistralai/Mistral-Nemo-Instruct-2407',
    name: 'Mistral-Nemo-12B',
    family: 'Mistral',
    params: '12B',
    activeParams: '12B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~24 GB',
    vramFP8: '~12 GB',
    downloadSize: '24 GB',
    estimatedDownloadTime: '~2 minutes',
    estimatedLoadTime: '~18 seconds',
    tensorParallelism: 'TP=1',
    recommendedGPU: 'L4 (24 GB), A10G (24 GB), or A100',
    gated: false,
    description:
      'Co-developed with NVIDIA. 128K context. Strong multilingual support. Apache 2.0.',
  },
  {
    id: 'mistralai/Mistral-Small-24B-Instruct-2501',
    name: 'Mistral-Small-24B',
    family: 'Mistral',
    params: '24B',
    activeParams: '24B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~48 GB',
    vramFP8: '~24 GB',
    downloadSize: '48 GB',
    estimatedDownloadTime: '~4 minutes',
    estimatedLoadTime: '~30 seconds',
    tensorParallelism: 'TP=1 (A100-80GB) or TP=2 (2x A100-40GB)',
    recommendedGPU: 'A100-80GB (TP=1) or A100-40GB (TP=2)',
    gated: false,
    description:
      'Mistral medium-size model. Strong coding and function calling. Good for production API services.',
  },
  {
    id: 'mistral-community/Mixtral-8x7B-Instruct-v0.1',
    name: 'Mixtral-8x7B-Instruct',
    family: 'Mistral',
    params: '47B',
    activeParams: '13B',
    type: 'MoE',
    precision: 'BF16',
    vramFP16: '~94 GB',
    vramFP8: '~47 GB',
    downloadSize: '94 GB',
    estimatedDownloadTime: '~8 minutes',
    estimatedLoadTime: '~60 seconds',
    tensorParallelism: 'TP=2 (2x A100-80GB) at BF16, or TP=1 (A100-80GB) at FP8',
    recommendedGPU: '2x A100-80GB (TP=2) or 1x A100-80GB at FP8',
    gated: false,
    description:
      'First popular open MoE model. 8 experts, 2 active per token. Apache 2.0. Community-hosted version is ungated.',
  },
  {
    id: 'mistral-community/Mixtral-8x22B-v0.1',
    name: 'Mixtral-8x22B',
    family: 'Mistral',
    params: '141B',
    activeParams: '39B',
    type: 'MoE',
    precision: 'BF16',
    vramFP16: '~282 GB',
    vramFP8: '~141 GB',
    downloadSize: '282 GB',
    estimatedDownloadTime: '~25 minutes',
    estimatedLoadTime: '~4 minutes',
    tensorParallelism: 'TP=4 (4x A100-80GB) or TP=2 (2x H200)',
    recommendedGPU: '4x A100-80GB (TP=4) or 2x H200 (TP=2, tight)',
    gated: false,
    description:
      'Larger MoE from Mistral. 39B active parameters gives strong quality. Requires significant GPU resources.',
  },
  // ---- DeepSeek Family ----
  {
    id: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
    name: 'DeepSeek-R1-Distill-7B',
    family: 'DeepSeek',
    params: '7B',
    activeParams: '7B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~14 GB',
    vramFP8: '~7 GB',
    downloadSize: '14 GB',
    estimatedDownloadTime: '~1 minute',
    estimatedLoadTime: '~12 seconds',
    tensorParallelism: 'TP=1',
    recommendedGPU: 'T4 (16 GB), L4 (24 GB), or better',
    gated: false,
    description:
      'Distilled from DeepSeek-R1. Strong reasoning at small size. MIT licensed.',
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
    name: 'DeepSeek-R1-Distill-32B',
    family: 'DeepSeek',
    params: '32B',
    activeParams: '32B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~64 GB',
    vramFP8: '~32 GB',
    downloadSize: '64 GB',
    estimatedDownloadTime: '~5 minutes',
    estimatedLoadTime: '~45 seconds',
    tensorParallelism: 'TP=1 (A100-80GB/H100)',
    recommendedGPU: 'A100-80GB or H100',
    gated: false,
    description:
      'Best reasoning-to-size ratio among distilled models. Competitive with much larger models on math and coding benchmarks.',
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
    name: 'DeepSeek-R1-Distill-70B',
    family: 'DeepSeek',
    params: '70B',
    activeParams: '70B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~140 GB',
    vramFP8: '~70 GB',
    downloadSize: '140 GB',
    estimatedDownloadTime: '~12 minutes',
    estimatedLoadTime: '~90 seconds',
    tensorParallelism: 'TP=2 (2x A100-80GB or 2x H100)',
    recommendedGPU: '2x A100-80GB (TP=2) or 2x H100 (TP=2)',
    gated: false,
    description:
      'Largest R1 distill. Near R1-full reasoning quality. Requires 2 GPUs at full precision.',
  },
  {
    id: 'deepseek-ai/DeepSeek-V3',
    name: 'DeepSeek-V3',
    family: 'DeepSeek',
    params: '671B',
    activeParams: '37B',
    type: 'MoE',
    precision: 'BF16',
    vramFP16: '~1.3 TB',
    vramFP8: '~671 GB',
    downloadSize: '1.3 TB',
    estimatedDownloadTime: '~2 hours',
    estimatedLoadTime: '~15 minutes',
    tensorParallelism: 'TP=8 per node, multi-node recommended',
    recommendedGPU: '8x H100 (single node at FP8) or multi-node H200 cluster',
    gated: false,
    description:
      'Massive MoE model. 671B total, 37B active. Used in llm-d official benchmarks. Requires a full GPU node or multi-node setup.',
  },
  {
    id: 'deepseek-ai/DeepSeek-R1',
    name: 'DeepSeek-R1',
    family: 'DeepSeek',
    params: '671B',
    activeParams: '37B',
    type: 'MoE',
    precision: 'BF16',
    vramFP16: '~1.3 TB',
    vramFP8: '~671 GB',
    downloadSize: '1.3 TB',
    estimatedDownloadTime: '~2 hours',
    estimatedLoadTime: '~15 minutes',
    tensorParallelism: 'TP=8 per node, multi-node recommended',
    recommendedGPU: '8x H100 or 8x H200 at FP8. Multi-node for BF16.',
    gated: false,
    description:
      'Full reasoning model from DeepSeek. Chain-of-thought reasoning built in. Same architecture as V3 but trained with RL for reasoning tasks.',
  },
  // ---- Google Gemma Family ----
  {
    id: 'google/gemma-3-4b-it',
    name: 'Gemma-3-4B-IT',
    family: 'Gemma',
    params: '4B',
    activeParams: '4B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~8 GB',
    vramFP8: '~4 GB',
    downloadSize: '8 GB',
    estimatedDownloadTime: '~30 seconds',
    estimatedLoadTime: '~8 seconds',
    tensorParallelism: 'TP=1',
    recommendedGPU: 'T4 (16 GB) or better',
    gated: true,
    description:
      'Google lightweight model. Strong for its size, especially multilingual. Requires Google approval on HuggingFace.',
  },
  {
    id: 'google/gemma-3-12b-it',
    name: 'Gemma-3-12B-IT',
    family: 'Gemma',
    params: '12B',
    activeParams: '12B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~24 GB',
    vramFP8: '~12 GB',
    downloadSize: '24 GB',
    estimatedDownloadTime: '~2 minutes',
    estimatedLoadTime: '~18 seconds',
    tensorParallelism: 'TP=1',
    recommendedGPU: 'L4 (24 GB) or A100',
    gated: true,
    description:
      'Mid-size Gemma with multimodal capabilities. Vision and text in one model. Google gated.',
  },
  {
    id: 'google/gemma-3-27b-it',
    name: 'Gemma-3-27B-IT',
    family: 'Gemma',
    params: '27B',
    activeParams: '27B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~54 GB',
    vramFP8: '~27 GB',
    downloadSize: '54 GB',
    estimatedDownloadTime: '~4 minutes',
    estimatedLoadTime: '~35 seconds',
    tensorParallelism: 'TP=1 (A100-80GB/H100)',
    recommendedGPU: 'A100-80GB or H100',
    gated: true,
    description:
      'Largest Gemma. Competitive with Llama 3.1 70B on many tasks at nearly half the size. Google gated.',
  },
  // ---- Microsoft Phi Family ----
  {
    id: 'microsoft/Phi-4-mini-instruct',
    name: 'Phi-4-Mini (3.8B)',
    family: 'Phi',
    params: '3.8B',
    activeParams: '3.8B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~8 GB',
    vramFP8: '~4 GB',
    downloadSize: '8 GB',
    estimatedDownloadTime: '~30 seconds',
    estimatedLoadTime: '~8 seconds',
    tensorParallelism: 'TP=1',
    recommendedGPU: 'Any NVIDIA GPU (T4+)',
    gated: false,
    description:
      'Microsoft small language model. Punches well above its weight on reasoning and coding. MIT licensed.',
  },
  {
    id: 'microsoft/phi-4',
    name: 'Phi-4 (14B)',
    family: 'Phi',
    params: '14B',
    activeParams: '14B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~28 GB',
    vramFP8: '~14 GB',
    downloadSize: '28 GB',
    estimatedDownloadTime: '~2 minutes',
    estimatedLoadTime: '~20 seconds',
    tensorParallelism: 'TP=1',
    recommendedGPU: 'A10G (24 GB, tight), A100, or H100',
    gated: false,
    description:
      'Phi flagship. Competitive with much larger models on STEM, math, and coding. MIT licensed.',
  },
  // ---- Falcon Family ----
  {
    id: 'tiiuae/falcon-40b-instruct',
    name: 'Falcon-40B-Instruct',
    family: 'Falcon',
    params: '40B',
    activeParams: '40B',
    type: 'dense',
    precision: 'BF16',
    vramFP16: '~80 GB',
    vramFP8: '~40 GB',
    downloadSize: '80 GB',
    estimatedDownloadTime: '~7 minutes',
    estimatedLoadTime: '~50 seconds',
    tensorParallelism: 'TP=1 (A100-80GB/H100) or TP=2 (2x A100-40GB)',
    recommendedGPU: 'A100-80GB or H100',
    gated: false,
    description:
      'Apache 2.0 licensed from TII. Older but still used in production. Ungated, no approval needed.',
  },
]

// ---- Mission Steps --------------------------------------------------------

export interface MissionStep {
  id: string
  instruction: string
  hint: string
  acceptedCommands: string[]
  output: string[]
  explanation: string
  simulatedDelay?: number
  isModelDependent?: boolean
}

export interface Mission {
  id: string
  title: string
  description: string
  steps: MissionStep[]
}

// ---- Helper: Model-Dependent Output Functions -----------------------------

export function getModelDependentOutput(
  stepId: string,
  modelId: string
): string[] | null {
  const model = MODEL_OPTIONS.find((m) => m.id === modelId)
  if (!model) return null

  const shortName = model.name

  switch (stepId) {
    case 'mission4-apply-vllm':
      return [
        `deployment.apps/vllm-decode created`,
        `  model: ${modelId}`,
        `  gpu-memory-utilization: 0.9`,
        `  tensor-parallel-size: ${modelId.includes('72B') ? '2' : '1'}`,
      ]

    case 'mission4-get-pods':
      if (modelId === 'Qwen/Qwen3-0.6B') {
        return [
          'NAME                           READY   STATUS    RESTARTS   AGE',
          'vllm-decode-7b4f8c9d65-k2x9m   1/1     Running   0          5s',
        ]
      }
      return [
        'NAME                           READY   STATUS              RESTARTS   AGE',
        'vllm-decode-7b4f8c9d65-k2x9m   0/1     ContainerCreating   0          3s',
        '',
        '... waiting for container to start ...',
        '',
        'NAME                           READY   STATUS    RESTARTS   AGE',
        'vllm-decode-7b4f8c9d65-k2x9m   1/1     Running   0          47s',
      ]

    case 'mission4-logs': {
      const lines: string[] = []
      if (modelId !== 'Qwen/Qwen3-0.6B') {
        lines.push(
          `INFO 06-09 14:22:01 model_runner.py:1024] Loading model weights for ${shortName}...`
        )
      }
      if (
        modelId.includes('72B') ||
        modelId.includes('70B') ||
        modelId.includes('32B')
      ) {
        lines.push(
          'INFO 06-09 14:22:18 model_runner.py:1031] Loading weights: 100%|##########| 47/47 shards'
        )
        lines.push(
          'INFO 06-09 14:22:23 model_runner.py:1045] Memory profiling complete. GPU blocks: 8192, CPU blocks: 2048'
        )
      }
      lines.push(
        'INFO 06-09 14:22:31 api_server.py:235] vLLM API server v0.8.5'
      )
      lines.push(
        `INFO 06-09 14:22:31 api_server.py:236] Model: ${modelId}`
      )
      lines.push(
        'INFO 06-09 14:22:31 launcher.py:21] Application startup complete.'
      )
      return lines
    }

    case 'mission6-curl-direct':
      return [
        '{',
        `    "id": "chatcmpl-abc123def456",`,
        `    "object": "chat.completion",`,
        `    "created": 1749489751,`,
        `    "model": "${modelId}",`,
        `    "choices": [`,
        '        {',
        '            "index": 0,',
        '            "message": {',
        '                "role": "assistant",',
        `                "content": "Kubernetes is an open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications across clusters of machines. It uses declarative configuration to define desired state, then continuously reconciles actual state to match. Key abstractions include Pods (the smallest deployable unit), Services (stable network endpoints), and Deployments (which manage replica sets for rolling updates)."`,
        '            },',
        '            "finish_reason": "stop"',
        '        }',
        '    ],',
        '    "usage": {',
        '        "prompt_tokens": 17,',
        '        "completion_tokens": 82,',
        '        "total_tokens": 99',
        '    }',
        '}',
      ]

    case 'mission6-curl-router':
      return [
        '{',
        `    "id": "chatcmpl-xyz789ghi012",`,
        `    "object": "chat.completion",`,
        `    "created": 1749489793,`,
        `    "model": "${modelId}",`,
        `    "choices": [`,
        '        {',
        '            "index": 0,',
        '            "message": {',
        '                "role": "assistant",',
        `                "content": "Kubernetes is a container orchestration system originally developed by Google and now maintained by the CNCF. It groups containers into logical units called Pods, schedules them across a cluster, and provides built-in service discovery, load balancing, and self-healing. Operators interact with Kubernetes through declarative YAML manifests and the kubectl CLI, while controllers continuously ensure the cluster matches the desired state."`,
        '            },',
        '            "finish_reason": "stop"',
        '        }',
        '    ],',
        '    "usage": {',
        '        "prompt_tokens": 17,',
        '        "completion_tokens": 78,',
        '        "total_tokens": 95',
        '    }',
        '}',
      ]

    case 'mission6-curl-followup':
      return [
        '{',
        `    "id": "chatcmpl-fol345low678",`,
        `    "object": "chat.completion",`,
        `    "created": 1749489801,`,
        `    "model": "${modelId}",`,
        `    "choices": [`,
        '        {',
        '            "index": 0,',
        '            "message": {',
        '                "role": "assistant",',
        `                "content": "A Pod is the smallest deployable unit in Kubernetes. It wraps one or more containers that share the same network namespace, IP address, and storage volumes. Pods are ephemeral by design. When a Pod fails, the controller (such as a Deployment or StatefulSet) creates a replacement rather than restarting the original. This is why you never manage Pods directly in production. Instead, you define higher-level resources that manage Pod lifecycles for you."`,
        '            },',
        '            "finish_reason": "stop"',
        '        }',
        '    ],',
        '    "usage": {',
        '        "prompt_tokens": 112,',
        '        "completion_tokens": 91,',
        '        "total_tokens": 203',
        '    }',
        '}',
      ]

    default:
      return null
  }
}

export function getModelDependentDelay(
  stepId: string,
  modelId: string
): number {
  if (stepId === 'mission4-logs') {
    switch (modelId) {
      case 'Qwen/Qwen3-0.6B':
        return 1000
      case 'Qwen/Qwen3-14B':
        return 3000
      case 'Qwen/Qwen3-32B':
        return 5000
      case 'Qwen/Qwen2.5-72B-Instruct':
        return 8000
      case 'RedHatAI/Llama-3.3-70B-Instruct-FP8-dynamic':
        return 6000
      default:
        return 3000
    }
  }
  return 0
}

// ---- Missions -------------------------------------------------------------

export const MISSIONS: Mission[] = [
  // =========================================================================
  // MISSION 1: Connect to the Cluster
  // =========================================================================
  {
    id: 'mission1',
    title: 'Connect to the Cluster',
    description:
      'Log into the OpenShift cluster, verify your identity, create a project namespace, and locate the GPU node.',
    steps: [
      {
        id: 'mission1-login',
        instruction:
          'Log into the OpenShift cluster using the oc CLI. Use admin as the username.',
        hint: 'Try: oc login -u admin -p password https://api.cluster.example.com:6443',
        acceptedCommands: [
          'oc login -u admin -p password https://api.cluster.example.com:6443',
          'oc login',
        ],
        output: [
          'Login successful.',
          '',
          'You have access to 91 projects, the list has been suppressed. You can list all projects with "oc projects"',
          '',
          'Using project "default".',
        ],
        explanation:
          'Authenticates you with the OpenShift cluster. The -u flag specifies the username, -p the password, and the URL points to the cluster API server on port 6443.',
      },
      {
        id: 'mission1-whoami',
        instruction: 'Verify your identity on the cluster.',
        hint: 'Try: oc whoami',
        acceptedCommands: ['oc whoami'],
        output: ['admin'],
        explanation:
          'Verifies your identity on the cluster. Useful to confirm you are logged into the right account before making changes.',
      },
      {
        id: 'mission1-new-project',
        instruction:
          'Create a new project called llm-d-demo to isolate your deployment.',
        hint: 'Try: oc new-project llm-d-demo',
        acceptedCommands: [
          'oc new-project llm-d-demo',
          'oc create namespace llm-d-demo',
        ],
        output: [
          'Now using project "llm-d-demo" on server "https://api.cluster.example.com:6443".',
          '',
          'You can add applications to this project with the "new-app" command. For example, try:',
          '',
          '    oc new-app rails-postgresql-example',
          '',
          'to build a new example application in Ruby. Or use kubectl to deploy a simple Kubernetes application:',
          '',
          '    kubectl create deployment hello-node --image=registry.k8s.io/e2e-test-images/agnhost:2.43 -- /agnhost serve-hostname',
        ],
        explanation:
          'Creates a new Kubernetes namespace called llm-d-demo. This isolates your deployment from other workloads on the cluster.',
      },
      {
        id: 'mission1-get-nodes',
        instruction:
          'List all nodes in the cluster. Look for one with GPU capabilities.',
        hint: 'Try: oc get nodes',
        acceptedCommands: ['oc get nodes', 'kubectl get nodes'],
        output: [
          'NAME                           STATUS   ROLES                  AGE    VERSION',
          'master-0.cluster.example.com   Ready    control-plane,master   142d   v1.31.4+caf3590',
          'master-1.cluster.example.com   Ready    control-plane,master   142d   v1.31.4+caf3590',
          'master-2.cluster.example.com   Ready    control-plane,master   142d   v1.31.4+caf3590',
          'worker-0.cluster.example.com   Ready    worker                 142d   v1.31.4+caf3590',
          'worker-1.cluster.example.com   Ready    worker                 142d   v1.31.4+caf3590',
          'worker-gpu.cluster.example.com Ready    worker                 142d   v1.31.4+caf3590',
        ],
        explanation:
          'Lists all nodes in the cluster. You are looking for a node with a GPU. The worker-gpu node is where your model server will run.',
      },
      {
        id: 'mission1-get-gpu-nodes',
        instruction: 'Filter for nodes that have an NVIDIA GPU.',
        hint: 'Try: oc get nodes -l nvidia.com/gpu.present=true',
        acceptedCommands: [
          'oc get nodes -l nvidia.com/gpu.present=true',
          'kubectl get nodes -l nvidia.com/gpu.present=true',
        ],
        output: [
          'NAME                             STATUS   ROLES    AGE    VERSION',
          'worker-gpu.cluster.example.com   Ready    worker   142d   v1.31.4+caf3590',
        ],
        explanation:
          'Filters nodes by the GPU label. This confirms there is at least one node with an NVIDIA GPU available for inference.',
      },
    ],
  },

  // =========================================================================
  // MISSION 2: Install the Foundation
  // =========================================================================
  {
    id: 'mission2',
    title: 'Install the Foundation',
    description:
      'Clone the llm-d repository and install the Gateway API and Inference Extension CRDs that llm-d depends on.',
    steps: [
      {
        id: 'mission2-clone',
        instruction:
          'Clone the llm-d repository from GitHub.',
        hint: 'Try: cd /tmp && rm -rf llm-d && git clone https://github.com/llm-d/llm-d.git && cd llm-d',
        acceptedCommands: [
          'cd /tmp && rm -rf llm-d && git clone https://github.com/llm-d/llm-d.git && cd llm-d',
          'git clone https://github.com/llm-d/llm-d.git',
        ],
        output: [
          'Cloning into \'llm-d\'...',
          'remote: Enumerating objects: 10439, done.',
          'remote: Counting objects: 100% (2817/2817), done.',
          'remote: Compressing objects: 100% (1043/1043), done.',
          'remote: Total 10439 (delta 1891), reused 2344 (delta 1618), pack-reused 7622 (from 3)',
          'Receiving objects: 100% (10439/10439), 4.72 MiB | 18.91 MiB/s, done.',
          'Resolving deltas: 100% (6102/6102), done.',
        ],
        explanation:
          'Clones the llm-d repository which contains all deployment guides, well-lit path recipes, and configuration templates.',
        simulatedDelay: 2000,
      },
      {
        id: 'mission2-gateway-api-crds',
        instruction:
          'Install the Gateway API CRDs. These are the standard Kubernetes building blocks for traffic routing.',
        hint: 'Try: oc apply -k "https://github.com/kubernetes-sigs/gateway-api/config/crd/?ref=v1.5.1"',
        acceptedCommands: [
          'oc apply -k "https://github.com/kubernetes-sigs/gateway-api/config/crd/?ref=v1.5.1"',
          'kubectl apply -k "https://github.com/kubernetes-sigs/gateway-api/config/crd/?ref=v1.5.1"',
        ],
        output: [
          'customresourcedefinition.apiextensions.k8s.io/backendtlspolicies.gateway.networking.k8s.io configured',
          'customresourcedefinition.apiextensions.k8s.io/gatewayclasses.gateway.networking.k8s.io configured',
          'customresourcedefinition.apiextensions.k8s.io/gateways.gateway.networking.k8s.io configured',
          'customresourcedefinition.apiextensions.k8s.io/grpcroutes.gateway.networking.k8s.io configured',
          'customresourcedefinition.apiextensions.k8s.io/httproutes.gateway.networking.k8s.io configured',
          'customresourcedefinition.apiextensions.k8s.io/listenersets.gateway.networking.k8s.io configured',
          'customresourcedefinition.apiextensions.k8s.io/referencegrants.gateway.networking.k8s.io configured',
          'customresourcedefinition.apiextensions.k8s.io/tlsroutes.gateway.networking.k8s.io configured',
          'admissionpolicy.apiextensions.k8s.io/gateway-api-admission-policy configured',
          'validatingadmissionpolicy.apiextensions.k8s.io/gateway-api-validating-admission-policy configured',
        ],
        explanation:
          'Installs the standard Gateway API Custom Resource Definitions. These are the Kubernetes building blocks that let you define how traffic enters and routes through the cluster.',
      },
      {
        id: 'mission2-inference-crds',
        instruction:
          'Install the Inference Extension CRDs. These add InferencePool and InferenceModel resources for llm-d.',
        hint: 'Try: oc apply -k "https://github.com/kubernetes-sigs/gateway-api-inference-extension/config/crd/?ref=v1.5.0"',
        acceptedCommands: [
          'oc apply -k "https://github.com/kubernetes-sigs/gateway-api-inference-extension/config/crd/?ref=v1.5.0"',
          'kubectl apply -k "https://github.com/kubernetes-sigs/gateway-api-inference-extension/config/crd/?ref=v1.5.0"',
        ],
        output: [
          'customresourcedefinition.apiextensions.k8s.io/inferencemodelrewrites.inference.networking.x-k8s.io configured',
          'customresourcedefinition.apiextensions.k8s.io/inferenceobjectives.inference.networking.x-k8s.io configured',
          'customresourcedefinition.apiextensions.k8s.io/inferencepoolimports.inference.networking.x-k8s.io configured',
          'customresourcedefinition.apiextensions.k8s.io/inferencepools.inference.networking.x-k8s.io configured',
        ],
        explanation:
          'Installs the Inference Extension CRDs. These add InferencePool and InferenceModel resources that llm-d uses to discover and route to model server pods.',
      },
    ],
  },

  // =========================================================================
  // MISSION 3: Deploy the Gateway
  // =========================================================================
  {
    id: 'mission3',
    title: 'Deploy the Gateway',
    description:
      'Install AgentGateway as the traffic entry point and configure it to work with llm-d.',
    steps: [
      {
        id: 'mission3-helm-install',
        instruction:
          'Install AgentGateway using Helm. This will be the traffic entry point for your inference requests.',
        hint: 'Try: helm install agentgateway oci://ghcr.io/agentgateway/charts/agentgateway --version v1.1.0 --namespace agentgateway-system --create-namespace',
        acceptedCommands: [
          'helm install agentgateway oci://ghcr.io/agentgateway/charts/agentgateway --version v1.1.0 --namespace agentgateway-system --create-namespace',
        ],
        output: [
          'Pulled: ghcr.io/agentgateway/charts/agentgateway:v1.1.0',
          'Digest: sha256:a3b1c4d5e6f7890123456789abcdef0123456789abcdef0123456789abcdef01',
          'NAME: agentgateway',
          'LAST DEPLOYED: Mon Jun  9 14:18:32 2026',
          'NAMESPACE: agentgateway-system',
          'STATUS: deployed',
          'REVISION: 1',
          'TEST SUITE: None',
          'NOTES:',
          'AgentGateway has been installed.',
          'To verify the installation, run:',
          '  kubectl get pods -n agentgateway-system',
        ],
        explanation:
          'Installs AgentGateway as the traffic entry point. It handles TLS termination, rate limiting, and forwards requests to the llm-d router via the ext-proc protocol. AgentGateway is one of two supported gateways (the other is Envoy).',
        simulatedDelay: 1500,
      },
      {
        id: 'mission3-apply-gateway',
        instruction:
          'Apply the Gateway configuration that connects AgentGateway to the llm-d routing layer.',
        hint: 'Try: oc apply -k guides/recipes/gateway/agentgateway/',
        acceptedCommands: [
          'oc apply -k guides/recipes/gateway/agentgateway/',
          'kubectl apply -k guides/recipes/gateway/agentgateway/',
        ],
        output: [
          'gateway.gateway.networking.k8s.io/llm-d-inference-gateway created',
        ],
        explanation:
          'Creates the Gateway resource that configures AgentGateway to work with llm-d. This sets up the listener and connects it to the routing layer.',
      },
      {
        id: 'mission3-get-pods',
        instruction:
          'Verify the gateway pod is running in the agentgateway-system namespace.',
        hint: 'Try: oc get pods -n agentgateway-system',
        acceptedCommands: [
          'oc get pods -n agentgateway-system',
          'kubectl get pods -n agentgateway-system',
        ],
        output: [
          'NAME                              READY   STATUS    RESTARTS   AGE',
          'agentgateway-5d8f7c9b64-vnp2q     0/1     Running   0          12s',
          '',
          '... waiting for readiness probe ...',
          '',
          'NAME                              READY   STATUS    RESTARTS   AGE',
          'agentgateway-5d8f7c9b64-vnp2q     1/1     Running   0          28s',
        ],
        explanation:
          'Verifies the gateway pod is running. It may take a few seconds to become fully ready.',
      },
    ],
  },

  // =========================================================================
  // MISSION 4: Deploy the Model Server
  // =========================================================================
  {
    id: 'mission4',
    title: 'Deploy the Model Server',
    description:
      'Select a model and deploy vLLM as the inference engine. The model server runs on the GPU node and serves the OpenAI-compatible API.',
    steps: [
      {
        id: 'mission4-apply-vllm',
        instruction:
          'Apply the vLLM deployment configuration to launch the model server.',
        hint: 'Try: oc apply -f vllm-deploy.yaml',
        acceptedCommands: [
          'oc apply -f vllm-deploy.yaml',
          'kubectl apply -f vllm-deploy.yaml',
        ],
        output: [
          'deployment.apps/vllm-decode created',
        ],
        explanation:
          'Deploys vLLM as the model server. The YAML includes GPU tolerations so the pod schedules on the GPU node, volume mounts for cache directories that vLLM needs, and the label llm-d.ai/guide=optimized-baseline so the InferencePool can find it.',
        isModelDependent: true,
      },
      {
        id: 'mission4-get-pods',
        instruction:
          'Check if the model server pod is running.',
        hint: 'Try: oc get pods -n llm-d-demo',
        acceptedCommands: [
          'oc get pods -n llm-d-demo',
          'kubectl get pods -n llm-d-demo',
        ],
        output: [
          'NAME                           READY   STATUS              RESTARTS   AGE',
          'vllm-decode-7b4f8c9d65-k2x9m   0/1     ContainerCreating   0          3s',
          '',
          '... waiting for container to start ...',
          '',
          'NAME                           READY   STATUS    RESTARTS   AGE',
          'vllm-decode-7b4f8c9d65-k2x9m   1/1     Running   0          47s',
        ],
        explanation:
          'Checks if the model server pod is running. Larger models take longer to download and load into GPU memory.',
        isModelDependent: true,
      },
      {
        id: 'mission4-logs',
        instruction:
          'Check the vLLM logs to confirm the model is fully loaded and ready to serve.',
        hint: 'Try: oc logs deploy/vllm-decode -n llm-d-demo --tail=3',
        acceptedCommands: [
          'oc logs deploy/vllm-decode -n llm-d-demo --tail=3',
          'kubectl logs deploy/vllm-decode -n llm-d-demo --tail=3',
          'oc logs deploy/vllm-decode --tail=3',
        ],
        output: [
          'INFO 06-09 14:22:31 api_server.py:235] vLLM API server v0.8.5',
          'INFO 06-09 14:22:31 api_server.py:236] Model: Qwen/Qwen3-0.6B',
          'INFO 06-09 14:22:31 launcher.py:21] Application startup complete.',
        ],
        explanation:
          'Checks the vLLM logs to confirm the model is fully loaded. You should see "Application startup complete" before sending requests. Loading time depends on model size and whether the model is cached on the node.',
        simulatedDelay: 1000,
        isModelDependent: true,
      },
    ],
  },

  // =========================================================================
  // MISSION 5: Deploy the Router
  // =========================================================================
  {
    id: 'mission5',
    title: 'Deploy the Router',
    description:
      'Install the llm-d router (EPP). This is the intelligent request scheduler that picks the best pod for each inference request based on prefix cache overlap, queue depth, and predicted latency.',
    steps: [
      {
        id: 'mission5-helm-install',
        instruction:
          'Install the llm-d router using Helm with the optimized-baseline configuration.',
        hint: 'Try: helm install optimized-baseline oci://ghcr.io/llm-d/charts/llm-d-router-standalone-dev -f guides/recipes/router/base.values.yaml -f guides/optimized-baseline/router/optimized-baseline.values.yaml -n llm-d-demo --version v0',
        acceptedCommands: [
          'helm install optimized-baseline oci://ghcr.io/llm-d/charts/llm-d-router-standalone-dev -f guides/recipes/router/base.values.yaml -f guides/optimized-baseline/router/optimized-baseline.values.yaml -n llm-d-demo --version v0',
        ],
        output: [
          'Pulled: ghcr.io/llm-d/charts/llm-d-router-standalone-dev:v0',
          'Digest: sha256:e4f5a6b7c8d9012345678901234567890abcdef0123456789abcdef0123456789',
          'NAME: optimized-baseline',
          'LAST DEPLOYED: Mon Jun  9 14:24:11 2026',
          'NAMESPACE: llm-d-demo',
          'STATUS: deployed',
          'REVISION: 1',
          'TEST SUITE: None',
          'NOTES:',
          'llm-d router (EPP) has been deployed.',
          '',
          'The router is configured with the optimized-baseline profile:',
          '  - Prefix-aware scheduling: enabled',
          '  - Load-aware scoring: enabled',
          '  - Session affinity: enabled',
        ],
        explanation:
          'Installs the llm-d router (EPP, or Endpoint Picker). This is the brain of llm-d. It watches the InferencePool, scores available pods on prefix cache overlap, queue depth, and predicted latency, then picks the best pod for each request.',
        simulatedDelay: 1500,
      },
      {
        id: 'mission5-get-pods',
        instruction:
          'Verify that both the router and model server pods are running.',
        hint: 'Try: oc get pods -n llm-d-demo',
        acceptedCommands: [
          'oc get pods -n llm-d-demo',
          'kubectl get pods -n llm-d-demo',
        ],
        output: [
          'NAME                                      READY   STATUS    RESTARTS   AGE',
          'optimized-baseline-epp-6c8d9f7b55-ht4rw   2/2     Running   0          14s',
          'vllm-decode-7b4f8c9d65-k2x9m               1/1     Running   0          3m12s',
        ],
        explanation:
          'Now you have the full stack: model server and router. The EPP pod shows 2/2 because it runs two containers, the router and a sidecar.',
      },
      {
        id: 'mission5-get-inferencepool',
        instruction:
          'Confirm the InferencePool resource was created.',
        hint: 'Try: oc get inferencepool -n llm-d-demo',
        acceptedCommands: [
          'oc get inferencepool -n llm-d-demo',
          'kubectl get inferencepool -n llm-d-demo',
        ],
        output: [
          'NAME                  AGE',
          'optimized-baseline    11s',
        ],
        explanation:
          'Confirms the InferencePool resource exists. This is the Kubernetes CRD that connects the router to the model server pods via label selectors.',
      },
    ],
  },

  // =========================================================================
  // MISSION 6: Send Your First Request
  // =========================================================================
  {
    id: 'mission6',
    title: 'Send Your First Request',
    description:
      'Send inference requests directly to vLLM, then through the llm-d router. See how prefix caching makes follow-up requests faster.',
    steps: [
      {
        id: 'mission6-port-forward-vllm',
        instruction:
          'Set up a port-forward to the model server so you can send requests from your terminal.',
        hint: 'Try: oc port-forward deploy/vllm-decode 8000:8000 -n llm-d-demo &',
        acceptedCommands: [
          'oc port-forward deploy/vllm-decode 8000:8000 -n llm-d-demo &',
          'kubectl port-forward deploy/vllm-decode 8000:8000 -n llm-d-demo &',
        ],
        output: [
          'Forwarding from 127.0.0.1:8000 -> 8000',
          'Forwarding from [::1]:8000 -> 8000',
        ],
        explanation:
          'Creates a tunnel from your local machine to the model server pod. Port 8000 is where vLLM listens for requests. The & runs it in the background.',
      },
      {
        id: 'mission6-curl-direct',
        instruction:
          'Send a chat completion request directly to vLLM, bypassing the router.',
        hint: 'Try: curl -s http://localhost:8000/v1/chat/completions -H "Content-Type: application/json" -d \'{"model":"<MODEL>","messages":[{"role":"user","content":"Explain Kubernetes in three sentences."}],"max_tokens":150}\' | python3 -m json.tool',
        acceptedCommands: [
          'curl -s http://localhost:8000/v1/chat/completions -H "Content-Type: application/json" -d \'{"model":"<MODEL>","messages":[{"role":"user","content":"Explain Kubernetes in three sentences."}],"max_tokens":150}\' | python3 -m json.tool',
          'curl http://localhost:8000/v1/chat/completions',
          'curl localhost:8000/v1/chat/completions',
        ],
        output: [
          '{',
          '    "id": "chatcmpl-abc123def456",',
          '    "object": "chat.completion",',
          '    "created": 1749489751,',
          '    "model": "Qwen/Qwen3-0.6B",',
          '    "choices": [',
          '        {',
          '            "index": 0,',
          '            "message": {',
          '                "role": "assistant",',
          '                "content": "Kubernetes is an open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications across clusters of machines. It uses declarative configuration to define desired state, then continuously reconciles actual state to match. Key abstractions include Pods (the smallest deployable unit), Services (stable network endpoints), and Deployments (which manage replica sets for rolling updates)."',
          '            },',
          '            "finish_reason": "stop"',
          '        }',
          '    ],',
          '    "usage": {',
          '        "prompt_tokens": 17,',
          '        "completion_tokens": 82,',
          '        "total_tokens": 99',
          '    }',
          '}',
        ],
        explanation:
          'Sends a request directly to vLLM, bypassing the router. This is what plain vLLM looks like without llm-d. The response is OpenAI-compatible JSON.',
        simulatedDelay: 1500,
        isModelDependent: true,
      },
      {
        id: 'mission6-kill-port-forward',
        instruction:
          'Kill the port-forward to the model server so we can set up a new one to the router.',
        hint: 'Try: kill %1 2>/dev/null; sleep 1',
        acceptedCommands: [
          'kill %1 2>/dev/null; sleep 1',
          'kill %1',
        ],
        output: [
          '[1]  + terminated  oc port-forward deploy/vllm-decode 8000:8000 -n llm-d-demo',
        ],
        explanation:
          'Kills the port-forward to the model server so we can set up a new one to the router.',
      },
      {
        id: 'mission6-port-forward-router',
        instruction:
          'Set up a port-forward to the llm-d router service.',
        hint: 'Try: oc port-forward svc/optimized-baseline-epp 8080:80 -n llm-d-demo &',
        acceptedCommands: [
          'oc port-forward svc/optimized-baseline-epp 8080:80 -n llm-d-demo &',
          'kubectl port-forward svc/optimized-baseline-epp 8080:80 -n llm-d-demo &',
        ],
        output: [
          'Forwarding from 127.0.0.1:8080 -> 8081',
          'Forwarding from [::1]:8080 -> 8081',
        ],
        explanation:
          'Creates a tunnel to the llm-d router service. Port 80 is the HTTP endpoint for the router. Now requests will go through the EPP scoring pipeline before reaching the model server.',
      },
      {
        id: 'mission6-curl-router',
        instruction:
          'Send the same request, but this time through the llm-d router.',
        hint: 'Try: curl -s http://localhost:8080/v1/chat/completions -H "Content-Type: application/json" -d \'{"model":"<MODEL>","messages":[{"role":"user","content":"Explain Kubernetes in three sentences."}],"max_tokens":150}\' | python3 -m json.tool',
        acceptedCommands: [
          'curl -s http://localhost:8080/v1/chat/completions -H "Content-Type: application/json" -d \'{"model":"<MODEL>","messages":[{"role":"user","content":"Explain Kubernetes in three sentences."}],"max_tokens":150}\' | python3 -m json.tool',
          'curl http://localhost:8080/v1/chat/completions',
          'curl localhost:8080/v1/chat/completions',
        ],
        output: [
          '{',
          '    "id": "chatcmpl-xyz789ghi012",',
          '    "object": "chat.completion",',
          '    "created": 1749489793,',
          '    "model": "Qwen/Qwen3-0.6B",',
          '    "choices": [',
          '        {',
          '            "index": 0,',
          '            "message": {',
          '                "role": "assistant",',
          '                "content": "Kubernetes is a container orchestration system originally developed by Google and now maintained by the CNCF. It groups containers into logical units called Pods, schedules them across a cluster, and provides built-in service discovery, load balancing, and self-healing. Operators interact with Kubernetes through declarative YAML manifests and the kubectl CLI, while controllers continuously ensure the cluster matches the desired state."',
          '            },',
          '            "finish_reason": "stop"',
          '        }',
          '    ],',
          '    "usage": {',
          '        "prompt_tokens": 17,',
          '        "completion_tokens": 78,',
          '        "total_tokens": 95',
          '    }',
          '}',
        ],
        explanation:
          'Same request, but this time through the llm-d router. The response looks identical, but the router has now cached the prefix of this conversation.',
        simulatedDelay: 1500,
        isModelDependent: true,
      },
      {
        id: 'mission6-curl-followup',
        instruction:
          'Send a follow-up message that includes the conversation history. The router will detect the prefix match.',
        hint: 'Try: curl -s http://localhost:8080/v1/chat/completions -H "Content-Type: application/json" -d \'{"model":"<MODEL>","messages":[{"role":"user","content":"Explain Kubernetes in three sentences."},{"role":"assistant","content":"Kubernetes is a container orchestration system..."},{"role":"user","content":"What is a Pod?"}],"max_tokens":150}\' | python3 -m json.tool',
        acceptedCommands: [
          'curl -s http://localhost:8080/v1/chat/completions -H "Content-Type: application/json" -d \'{"model":"<MODEL>","messages":[{"role":"user","content":"Explain Kubernetes in three sentences."},{"role":"assistant","content":"Kubernetes is a container orchestration system..."},{"role":"user","content":"What is a Pod?"}],"max_tokens":150}\' | python3 -m json.tool',
          'curl http://localhost:8080/v1/chat/completions',
        ],
        output: [
          '{',
          '    "id": "chatcmpl-fol345low678",',
          '    "object": "chat.completion",',
          '    "created": 1749489801,',
          '    "model": "Qwen/Qwen3-0.6B",',
          '    "choices": [',
          '        {',
          '            "index": 0,',
          '            "message": {',
          '                "role": "assistant",',
          '                "content": "A Pod is the smallest deployable unit in Kubernetes. It wraps one or more containers that share the same network namespace, IP address, and storage volumes. Pods are ephemeral by design. When a Pod fails, the controller (such as a Deployment or StatefulSet) creates a replacement rather than restarting the original. This is why you never manage Pods directly in production. Instead, you define higher-level resources that manage Pod lifecycles for you."',
          '            },',
          '            "finish_reason": "stop"',
          '        }',
          '    ],',
          '    "usage": {',
          '        "prompt_tokens": 112,',
          '        "completion_tokens": 91,',
          '        "total_tokens": 203',
          '    }',
          '}',
        ],
        explanation:
          'This follow-up request includes the previous conversation. The router detects the prefix match and routes to the pod that already has the KV cache for this conversation. In production with multiple replicas, this avoids recomputing the entire conversation from scratch.',
        simulatedDelay: 800,
        isModelDependent: true,
      },
    ],
  },
]

// ---- Global Commands ------------------------------------------------------

export const GLOBAL_COMMANDS: Record<
  string,
  { output: string[]; explanation: string }
> = {
  help: {
    output: [
      'Available commands for this mission are shown in the instruction panel above.',
      'Type the command exactly as shown, or use the hint button if you get stuck.',
      '',
      'Global commands:',
      '  help      Show this help message',
      '  clear     Clear the terminal screen',
      '  whoami    Show current user',
      '  pwd       Show current directory',
      '  ls        List files in current directory',
      '  history   Show command history',
    ],
    explanation: 'Shows available commands and usage tips.',
  },
  clear: {
    output: [],
    explanation: 'Clears the terminal screen.',
  },
  whoami: {
    output: ['admin'],
    explanation: '',
  },
  pwd: {
    output: ['/tmp/llm-d'],
    explanation: '',
  },
  ls: {
    output: [
      'guides/  charts/  docs/  examples/  hack/  README.md  LICENSE  Makefile',
    ],
    explanation: '',
  },
  history: {
    output: [
      '    1  oc login -u admin -p password https://api.cluster.example.com:6443',
      '    2  oc whoami',
      '    3  oc new-project llm-d-demo',
    ],
    explanation: '',
  },
  'oc version': {
    output: [
      'Client Version: 4.17.10',
      'Kustomize Version: v5.0.4-0.20230601165947-6ce0bf390ce3',
      'Server Version: 4.17.10',
      'Kubernetes Version: v1.31.4+caf3590',
    ],
    explanation: '',
  },
  'kubectl version': {
    output: [
      'Client Version: v1.31.4',
      'Kustomize Version: v5.0.4-0.20230601165947-6ce0bf390ce3',
      'Server Version: v1.31.4+caf3590',
    ],
    explanation: '',
  },
  'helm version': {
    output: [
      'version.BuildInfo{Version:"v3.16.4", GitCommit:"7877b45b63f95635153e2c845e8205fe2fd32c6e", GitTreeState:"clean", GoVersion:"go1.22.10"}',
    ],
    explanation: '',
  },
}

// ---- Completion Message ---------------------------------------------------

export const COMPLETION_MESSAGE: string[] = [
  '',
  '====================================================================',
  '  MISSION COMPLETE: llm-d Deployment Successful',
  '====================================================================',
  '',
  '  You have successfully deployed a full llm-d inference stack:',
  '',
  '    1. OpenShift cluster with GPU node',
  '    2. Gateway API and Inference Extension CRDs',
  '    3. AgentGateway for traffic entry',
  '    4. vLLM model server on GPU',
  '    5. llm-d router (EPP) with prefix-aware scheduling',
  '',
  '  The router is now intelligently routing requests based on:',
  '    - Prefix cache overlap (reuse KV cache across requests)',
  '    - Queue depth (avoid overloaded pods)',
  '    - Predicted latency (meet SLO targets)',
  '',
  '  What to explore next:',
  '',
  '    > Architecture Deep Dive',
  '        Learn how the EPP, model server, and gateway',
  '        work together under the hood.',
  '',
  '    > Routing Simulation',
  '        See how different routing policies affect',
  '        latency, throughput, and cache hit rates.',
  '',
  '    > Capacity Planner',
  '        Estimate GPU requirements for your own',
  '        models and traffic patterns.',
  '',
  '    > Deployment Configurator',
  '        Generate production-ready YAML for your',
  '        specific infrastructure and model choices.',
  '',
  '====================================================================',
  '',
]
