"use client";

export function AvailableModelsSection() {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Available Models</h2>

      <div className="space-y-3 sm:hidden">
        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <code className="text-blue-500 dark:text-blue-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-[10px] break-all inline-block">geniuspro-superintelligence-v1</code>
          <div className="text-xs text-gray-600 dark:text-gray-300 mt-2">200K tokens</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Smart router that automatically selects the best model for each task.</p>
        </div>
        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <code className="text-green-600 dark:text-green-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-[10px]">geniuspro-coder-v1</code>
          <div className="text-xs text-gray-600 dark:text-gray-300 mt-2">32K tokens</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Optimized for coding tasks. Best for code generation, debugging, and docs.</p>
        </div>
        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <code className="text-purple-500 dark:text-purple-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-[10px]">geniuspro-voice</code>
          <div className="text-xs text-gray-600 dark:text-gray-300 mt-2">N/A</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Voice synthesis and recognition for audio processing and TTS.</p>
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
                <code className="text-blue-500 dark:text-blue-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">geniuspro-superintelligence-v1</code>
              </td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">200K tokens</td>
              <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">
                Smart router that automatically selects the best model (including Opus 4.6, GPT-5 Codex, etc.) for each task.
              </td>
            </tr>
            <tr className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4">
                <code className="text-green-600 dark:text-green-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">geniuspro-coder-v1</code>
              </td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">32K tokens</td>
              <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">
                Optimized for coding tasks. Best for code generation, debugging, and technical documentation.
              </td>
            </tr>
            <tr className="hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 lg:px-6 py-4">
                <code className="text-purple-500 dark:text-purple-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">geniuspro-voice</code>
              </td>
              <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">N/A</td>
              <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">
                Voice synthesis and recognition. Optimized for audio processing, transcription, and text-to-speech tasks.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

