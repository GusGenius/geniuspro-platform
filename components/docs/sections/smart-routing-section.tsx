"use client";

import { MODEL_AGI, MODEL_CODE_AGI } from "@/components/docs/docs-constants";

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
        <code className="bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">{MODEL_AGI}</code> (chat) and <code className="bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">{MODEL_CODE_AGI}</code> (coding) automatically route each request to the best model. You always see the model you requested in responses.
      </p>

      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Models</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-300 mb-4 space-y-1">
            <li><code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{MODEL_AGI}</code> — Chat: simple prompts use a fast tier; complex (summarization, memory, long conversations) use a smart tier.</li>
            <li><code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{MODEL_CODE_AGI}</code> — Coding: simple edits use a fast tier; complex (debug, refactor, multi-file) use the smartest coding tier.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">How it works</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Each request is analyzed before inference. Simple prompts use a fast, cost-effective tier. Complex prompts—long conversations, summarization, memory recall, debugging, or detailed analysis—are routed to a more capable tier.
          </p>
          <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/50">
                  <th className="px-4 py-3 font-medium">Condition</th>
                  <th className="px-4 py-3 font-medium">Tier</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Simple prompts (default)</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Fast</td>
                </tr>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Long prompts (&gt;2500 chars)</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Smart</td>
                </tr>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Long conversations (&gt;6 messages)</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Smart</td>
                </tr>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Summarization, memory, recall</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Smart</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Complexity keywords (debug, analyze, explain in detail, etc.)</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Smart</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Pricing</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            You pay for the tier that handles your request. Simple prompts cost less (~$0.28–0.30 per 1M input). Complex prompts cost more (~$0.42–1.20 per 1M output). Billing always shows <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{MODEL_AGI}</code>.
          </p>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Using a specific model</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            To bypass routing, set <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">model</code> to any model from the Available Models list (e.g. <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">claude-sonnet-4.5</code>, <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">gpt-5.3-codex</code>). For coding, use <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{MODEL_CODE_AGI}</code> for smart routing or <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">gpt-5.3-codex</code> for maximum capability.
          </p>
        </div>
      </div>
    </section>
  );
}
