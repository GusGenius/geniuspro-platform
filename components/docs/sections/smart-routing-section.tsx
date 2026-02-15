"use client";

import { MODEL_AGI } from "@/components/docs/docs-constants";

type Props = {
  icon: React.ComponentType<{ className?: string }>;
};

export function SmartRoutingSection({ icon: Icon }: Props) {
  return (
    <section id="smart-routing" className="mb-12 scroll-mt-24">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <Icon className="w-5 h-5 text-blue-400" />
        Smart Routing
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <code className="bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">{MODEL_AGI}</code> automatically routes each request to the best model for the task. You always see <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{MODEL_AGI}</code> in responses—the backend model stays hidden.
      </p>

      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">How it works</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Each request is analyzed before inference. Simple prompts go to a fast, cost-effective model. Complex prompts—long conversations, summarization, memory recall, debugging, or detailed analysis—are routed to a more capable model.
          </p>
          <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/50">
                  <th className="px-4 py-3 font-medium">Condition</th>
                  <th className="px-4 py-3 font-medium">Model</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Simple prompts (default)</td>
                  <td className="px-4 py-3"><code className="text-cyan-500 dark:text-cyan-400 bg-gray-200 dark:bg-gray-900 px-1.5 py-0.5 rounded text-xs">deepseek-chat</code></td>
                </tr>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Long prompts (&gt;2500 chars)</td>
                  <td className="px-4 py-3"><code className="text-amber-500 dark:text-amber-400 bg-gray-200 dark:bg-gray-900 px-1.5 py-0.5 rounded text-xs">minimax-m2.5</code></td>
                </tr>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Long conversations (&gt;6 messages)</td>
                  <td className="px-4 py-3"><code className="text-amber-500 dark:text-amber-400 bg-gray-200 dark:bg-gray-900 px-1.5 py-0.5 rounded text-xs">minimax-m2.5</code></td>
                </tr>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Summarization, memory, recall</td>
                  <td className="px-4 py-3"><code className="text-amber-500 dark:text-amber-400 bg-gray-200 dark:bg-gray-900 px-1.5 py-0.5 rounded text-xs">minimax-m2.5</code></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Complexity keywords (debug, analyze, explain in detail, etc.)</td>
                  <td className="px-4 py-3"><code className="text-amber-500 dark:text-amber-400 bg-gray-200 dark:bg-gray-900 px-1.5 py-0.5 rounded text-xs">minimax-m2.5</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Pricing</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            You pay for the model that actually handles your request. Simple prompts cost ~$0.28/$0.42 per 1M tokens (DeepSeek). Complex prompts cost ~$0.30/$1.20 per 1M tokens (MiniMax). Billing always shows <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{MODEL_AGI}</code>.
          </p>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Using a specific model</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            To bypass routing and use a model directly, set <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">model</code> to <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">deepseek-chat</code>, <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">minimax-m2.5</code>, or any other model from the list.
          </p>
        </div>
      </div>
    </section>
  );
}
