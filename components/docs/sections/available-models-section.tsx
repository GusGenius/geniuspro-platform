"use client";

import {
  API_BASE_URL_CODING_SUPERINTELLIGENCE,
  API_BASE_URL_GATEWAY,
  API_BASE_URL_SUPERINTELLIGENCE,
  API_BASE_URL_VISION,
  MODEL_CODER,
  MODEL_CODING_SUPERINTELLIGENCE,
  MODEL_SUPERINTELLIGENCE,
  MODEL_VOICE,
  MODEL_VISION,
} from "@/components/docs/docs-constants";

export function AvailableModelsSection() {
  return (
    <section id="available-models" className="mb-12 scroll-mt-24">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Available Models</h2>

      <div className="space-y-3 sm:hidden">
        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <code className="text-blue-500 dark:text-blue-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-[10px] break-all inline-block">{MODEL_SUPERINTELLIGENCE}</code>
          <div className="text-xs text-gray-600 dark:text-gray-300 mt-2">200K tokens</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">General Superintelligence router. Use with <span className="font-mono break-all">{API_BASE_URL_SUPERINTELLIGENCE}</span>.</p>
        </div>
        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <code className="text-purple-500 dark:text-purple-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-[10px] break-all inline-block">{MODEL_CODING_SUPERINTELLIGENCE}</code>
          <div className="text-xs text-gray-600 dark:text-gray-300 mt-2">200K tokens</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cursor-optimized Coding Superintelligence. Use with <span className="font-mono break-all">{API_BASE_URL_CODING_SUPERINTELLIGENCE}</span>.</p>
        </div>
        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <code className="text-green-600 dark:text-green-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-[10px] break-all inline-block">{MODEL_CODER}</code>
          <div className="text-xs text-gray-600 dark:text-gray-300 mt-2">32K tokens</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lightweight coding model on the gateway. Use with <span className="font-mono break-all">{API_BASE_URL_GATEWAY}</span>.</p>
        </div>
        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <code className="text-purple-500 dark:text-purple-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-[10px] break-all inline-block">{MODEL_VOICE}</code>
          <div className="text-xs text-gray-600 dark:text-gray-300 mt-2">N/A</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Voice synthesis and recognition on the gateway. Use with <span className="font-mono break-all">{API_BASE_URL_GATEWAY}</span>.</p>
        </div>
        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <code className="text-cyan-500 dark:text-cyan-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-[10px] break-all inline-block">{MODEL_VISION}</code>
          <div className="text-xs text-gray-600 dark:text-gray-300 mt-2">Image/Video</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">SAM 3 image and video segmentation. Use with <span className="font-mono break-all">{API_BASE_URL_VISION}</span>.</p>
        </div>
      </div>

      <div className="hidden sm:block bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/50">
              <th className="px-4 lg:px-6 py-4 font-medium">Model</th>
              <th className="px-4 lg:px-6 py-4 font-medium">Context</th>
              <th className="px-4 lg:px-6 py-4 font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4">
                <code className="text-blue-500 dark:text-blue-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">{MODEL_SUPERINTELLIGENCE}</code>
              </td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">200K tokens</td>
              <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">
                General Superintelligence router. Base URL: <span className="font-mono">{API_BASE_URL_SUPERINTELLIGENCE}</span>
              </td>
            </tr>
            <tr className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4">
                <code className="text-purple-500 dark:text-purple-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">{MODEL_CODING_SUPERINTELLIGENCE}</code>
              </td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">200K tokens</td>
              <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">
                Cursor-optimized Coding Superintelligence. Base URL: <span className="font-mono">{API_BASE_URL_CODING_SUPERINTELLIGENCE}</span>
              </td>
            </tr>
            <tr className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4">
                <code className="text-green-600 dark:text-green-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">{MODEL_CODER}</code>
              </td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">32K tokens</td>
              <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">
                Lightweight coding model on the gateway. Base URL: <span className="font-mono">{API_BASE_URL_GATEWAY}</span>
              </td>
            </tr>
            <tr className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4">
                <code className="text-purple-500 dark:text-purple-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">{MODEL_VOICE}</code>
              </td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">N/A</td>
              <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">
                Voice synthesis and recognition on the gateway. Base URL: <span className="font-mono">{API_BASE_URL_GATEWAY}</span>
              </td>
            </tr>
            <tr className="hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4">
                <code className="text-cyan-500 dark:text-cyan-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">{MODEL_VISION}</code>
              </td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">Image/Video</td>
              <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">
                SAM 3 image and video segmentation. Base URL: <span className="font-mono">{API_BASE_URL_VISION}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

