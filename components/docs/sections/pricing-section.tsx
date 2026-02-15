"use client";

import {
  MODEL_CLAUDE,
  MODEL_GPT_CODEX,
  MODEL_CODER,
  MODEL_VOICE,
  MODEL_MINIMAX,
} from "@/components/docs/docs-constants";

type Props = {
  icon: React.ComponentType<{ className?: string }>;
};

export function PricingSection({ icon: Icon }: Props) {
  return (
    <section id="pricing" className="mb-12 scroll-mt-24">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Icon className="w-5 h-5 text-blue-400" />
        Pricing
      </h2>

      <div className="space-y-3 sm:hidden">
        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <code className="text-blue-500 dark:text-blue-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-[10px] break-all inline-block">{MODEL_CLAUDE}</code>
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div><span className="text-gray-500 dark:text-gray-400">Input:</span> <span className="text-gray-600 dark:text-gray-300">$3.00/1M</span></div>
            <div><span className="text-gray-500 dark:text-gray-400">Output:</span> <span className="text-gray-600 dark:text-gray-300">$15.00/1M</span></div>
          </div>
        </div>
        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <code className="text-emerald-500 dark:text-emerald-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-[10px] break-all inline-block">{MODEL_GPT_CODEX}</code>
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div><span className="text-gray-500 dark:text-gray-400">Input:</span> <span className="text-gray-600 dark:text-gray-300">~$12/1M</span></div>
            <div><span className="text-gray-500 dark:text-gray-400">Output:</span> <span className="text-gray-600 dark:text-gray-300">~$48/1M</span></div>
          </div>
        </div>
        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <code className="text-amber-500 dark:text-amber-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-[10px] break-all inline-block">{MODEL_MINIMAX}</code>
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div><span className="text-gray-500 dark:text-gray-400">Input:</span> <span className="text-gray-600 dark:text-gray-300">$0.30/1M</span></div>
            <div><span className="text-gray-500 dark:text-gray-400">Output:</span> <span className="text-gray-600 dark:text-gray-300">$1.20/1M</span></div>
          </div>
        </div>
        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <code className="text-green-600 dark:text-green-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-[10px] break-all inline-block">{MODEL_CODER}</code>
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div><span className="text-gray-500 dark:text-gray-400">Input:</span> <span className="text-gray-600 dark:text-gray-300">$1.00/1M</span></div>
            <div><span className="text-gray-500 dark:text-gray-400">Output:</span> <span className="text-gray-600 dark:text-gray-300">$8.00/1M</span></div>
          </div>
        </div>
        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <code className="text-purple-500 dark:text-purple-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-[10px] break-all inline-block">{MODEL_VOICE}</code>
          <div className="mt-3 text-xs">
            <span className="text-gray-500 dark:text-gray-400">Per minute:</span> <span className="text-gray-600 dark:text-gray-300">$0.05</span>
          </div>
        </div>
      </div>

      <div className="hidden sm:block bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/50">
              <th className="px-4 lg:px-6 py-4 font-medium">Model</th>
              <th className="px-4 lg:px-6 py-4 font-medium whitespace-nowrap">Input (per 1M)</th>
              <th className="px-4 lg:px-6 py-4 font-medium whitespace-nowrap">Output (per 1M)</th>
              <th className="px-4 lg:px-6 py-4 font-medium">Other</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4">
                <code className="text-blue-500 dark:text-blue-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">{MODEL_CLAUDE}</code>
              </td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">$3.00</td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">$15.00</td>
              <td className="px-4 lg:px-6 py-4 text-gray-400">—</td>
            </tr>
            <tr className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4">
                <code className="text-emerald-500 dark:text-emerald-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">{MODEL_GPT_CODEX}</code>
              </td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">~$12</td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">~$48</td>
              <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">Coding</td>
            </tr>
            <tr className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4">
                <code className="text-amber-500 dark:text-amber-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">{MODEL_MINIMAX}</code>
              </td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">$0.30</td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">$1.20</td>
              <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">Cost-effective</td>
            </tr>
            <tr className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4">
                <code className="text-green-600 dark:text-green-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">{MODEL_CODER}</code>
              </td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">$1.00</td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">$8.00</td>
              <td className="px-4 lg:px-6 py-4 text-gray-400">—</td>
            </tr>
            <tr className="hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4">
                <code className="text-purple-500 dark:text-purple-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">{MODEL_VOICE}</code>
              </td>
              <td className="px-4 lg:px-6 py-4 text-gray-400">—</td>
              <td className="px-4 lg:px-6 py-4 text-gray-400">—</td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">$0.05 / minute</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

