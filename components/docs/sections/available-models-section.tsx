"use client";

import {
  API_BASE_URL,
  API_BASE_URL_VISION,
  MODEL_AGI,
  MODEL_CODE_AGI,
  MODEL_CLAUDE,
  MODEL_CLAUDE_OPUS,
  MODEL_GPT,
  MODEL_GPT_CODEX,
  MODEL_GEMINI,
  MODEL_DEEPSEEK,
  MODEL_MINIMAX,
  MODEL_DEVSTRAL,
  MODEL_VISION,
} from "@/components/docs/docs-constants";

export function AvailableModelsSection() {
  return (
    <section id="available-models" className="mb-12 scroll-mt-24">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Available Models</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Call <code className="bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">GET {API_BASE_URL}/models</code> for the full list. All models use base URL <span className="font-mono">{API_BASE_URL}</span>.
      </p>

      <div className="space-y-3 sm:hidden">
        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <code className="text-blue-500 dark:text-blue-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-[10px] break-all inline-block">{MODEL_AGI}</code>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Smart routing: fast for simple, upgrades for complex. See Smart Routing.</p>
        </div>
        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <code className="text-blue-500 dark:text-blue-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-[10px] break-all inline-block">{MODEL_CLAUDE_OPUS}</code>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Anthropic flagship. Best for coding & agents.</p>
        </div>
        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <code className="text-emerald-500 dark:text-emerald-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-[10px] break-all inline-block">{MODEL_CODE_AGI}</code>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Smart routing for coding. See Cursor Setup.</p>
        </div>
        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <code className="text-emerald-500 dark:text-emerald-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-[10px] break-all inline-block">{MODEL_GPT_CODEX}</code>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">OpenAI agentic coding model.</p>
        </div>
        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <code className="text-green-600 dark:text-green-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-[10px] break-all inline-block">{MODEL_DEVSTRAL}</code>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mistral open-source code agent.</p>
        </div>
        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <code className="text-amber-500 dark:text-amber-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-[10px] break-all inline-block">{MODEL_MINIMAX}</code>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">MiniMax M2.5 — cost-effective frontier.</p>
        </div>
        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <code className="text-purple-500 dark:text-purple-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-[10px] break-all inline-block">{MODEL_VISION}</code>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">SAM 3 segmentation. Base: <span className="font-mono">{API_BASE_URL_VISION}</span></p>
        </div>
      </div>

      <div className="hidden sm:block bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/50">
              <th className="px-4 lg:px-6 py-4 font-medium">Model</th>
              <th className="px-4 lg:px-6 py-4 font-medium">Provider</th>
              <th className="px-4 lg:px-6 py-4 font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4"><code className="text-blue-500 dark:text-blue-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">{MODEL_AGI}</code></td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">GeniusPro</td>
              <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">Smart routing: fast for simple, upgrades for complex. See Smart Routing.</td>
            </tr>
            <tr className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4"><code className="text-blue-500 dark:text-blue-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">{MODEL_CLAUDE_OPUS}</code></td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">Anthropic</td>
              <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">Flagship. Best for coding & agents.</td>
            </tr>
            <tr className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4"><code className="text-blue-500 dark:text-blue-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">{MODEL_CLAUDE}</code></td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">Anthropic</td>
              <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">Balance of speed and intelligence.</td>
            </tr>
            <tr className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4"><code className="text-emerald-500 dark:text-emerald-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">{MODEL_GPT}</code></td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">OpenAI</td>
              <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">Frontier general-purpose.</td>
            </tr>
            <tr className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4"><code className="text-emerald-500 dark:text-emerald-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">{MODEL_CODE_AGI}</code></td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">GeniusPro</td>
              <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">Smart routing for coding. See Cursor Setup.</td>
            </tr>
            <tr className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4"><code className="text-emerald-500 dark:text-emerald-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">{MODEL_GPT_CODEX}</code></td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">OpenAI</td>
              <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">Agentic coding model.</td>
            </tr>
            <tr className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4"><code className="text-amber-500 dark:text-amber-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">{MODEL_GEMINI}</code></td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">Google</td>
              <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">Multimodal, 1M context.</td>
            </tr>
            <tr className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4"><code className="text-cyan-500 dark:text-cyan-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">{MODEL_DEEPSEEK}</code></td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">DeepSeek</td>
              <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">Cost-effective, strong reasoning.</td>
            </tr>
            <tr className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4"><code className="text-amber-500 dark:text-amber-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">{MODEL_MINIMAX}</code></td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">MiniMax</td>
              <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">Cost-effective frontier (~1/20 Claude).</td>
            </tr>
            <tr className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4"><code className="text-green-600 dark:text-green-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">{MODEL_DEVSTRAL}</code></td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">Mistral</td>
              <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">Open-source code agent.</td>
            </tr>
            <tr className="hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4"><code className="text-cyan-500 dark:text-cyan-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">{MODEL_VISION}</code></td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">Vision</td>
              <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">SAM 3 segmentation. Base: <span className="font-mono">{API_BASE_URL_VISION}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

