"use client";

import { useState } from "react";
import { BookOpen, Copy, Check, Code, Zap, Terminal, DollarSign, Gauge } from "lucide-react";

export default function DocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const baseUrl = "https://api.geniuspro.io/v1";
  const modelName = "geniuspro-superintelligence-v1";
  const authHeader = "Authorization: Bearer YOUR_API_KEY";

  const curlExample = `curl https://api.geniuspro.io/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "geniuspro-superintelligence-v1",
    "messages": [
      {"role": "user", "content": "Explain quantum computing"}
    ]
  }'`;

  const pythonExample = `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.geniuspro.io/v1"
)

response = client.chat.completions.create(
    model="geniuspro-superintelligence-v1",
    messages=[
        {"role": "user", "content": "Explain quantum computing"}
    ]
)

print(response.choices[0].message.content)`;

  const jsExample = `import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'YOUR_API_KEY',
  baseURL: 'https://api.geniuspro.io/v1',
});

const response = await openai.chat.completions.create({
  model: 'geniuspro-superintelligence-v1',
  messages: [
    { role: 'user', content: 'Explain quantum computing' }
  ],
});

console.log(response.choices[0].message.content);`;

  return (
    <div className="min-h-full p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Documentation</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Learn how to integrate with the GeniusPro API</p>
        </div>

        {/* Quick Start */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            Quick Start
          </h2>
          
          <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              GeniusPro API is OpenAI-compatible. You can use the official OpenAI SDKs by simply changing the base URL.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-200 dark:bg-gray-900 rounded-lg p-4 relative group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Base URL</div>
                  <button
                    onClick={() => copyText(baseUrl, "base-url")}
                    className="p-1.5 rounded hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    title="Copy base URL"
                  >
                    {copiedText === "base-url" ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <code className="text-blue-500 dark:text-blue-400 font-mono text-sm">{baseUrl}</code>
              </div>
              <div className="bg-gray-200 dark:bg-gray-900 rounded-lg p-4 relative group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Model</div>
                  <button
                    onClick={() => copyText(modelName, "model-name")}
                    className="p-1.5 rounded hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    title="Copy model name"
                  >
                    {copiedText === "model-name" ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <code className="text-green-600 dark:text-green-400 font-mono text-sm">{modelName}</code>
              </div>
            </div>
          </div>
        </section>

        {/* Authentication */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-400" />
            Authentication
          </h2>
          
          <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Authenticate using your API key in the Authorization header:
            </p>
            
            <div className="bg-gray-200 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm relative group">
              <button
                onClick={() => copyText(authHeader, "auth-header")}
                className="absolute top-2 right-2 p-1.5 rounded hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                title="Copy authorization header"
              >
                {copiedText === "auth-header" ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <div>
                <span className="text-gray-400 dark:text-gray-500">Authorization:</span>{" "}
                <span className="text-green-600 dark:text-green-400">Bearer</span>{" "}
                <span className="text-blue-500 dark:text-blue-400">YOUR_API_KEY</span>
              </div>
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-400" />
            Code Examples
          </h2>
          
          <div className="space-y-6">
            {/* cURL */}
            <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/50">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">cURL</span>
                <button
                  onClick={() => copyCode(curlExample, "curl")}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                  {copiedCode === "curl" ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-500 dark:text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm bg-gray-50 dark:bg-gray-900/30">
                <code className="text-gray-700 dark:text-gray-300">{curlExample}</code>
              </pre>
            </div>

            {/* Python */}
            <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/50">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Python</span>
                <button
                  onClick={() => copyCode(pythonExample, "python")}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                  {copiedCode === "python" ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-500 dark:text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm bg-gray-50 dark:bg-gray-900/30">
                <code className="text-gray-700 dark:text-gray-300">{pythonExample}</code>
              </pre>
            </div>

            {/* JavaScript */}
            <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/50">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">JavaScript / TypeScript</span>
                <button
                  onClick={() => copyCode(jsExample, "js")}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                  {copiedCode === "js" ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-500 dark:text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm bg-gray-50 dark:bg-gray-900/30">
                <code className="text-gray-700 dark:text-gray-300">{jsExample}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Available Models */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Available Models</h2>
          
          {/* Card layout for mobile, table for desktop */}
          <div className="space-y-3 sm:hidden">
            <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <code className="text-blue-500 dark:text-blue-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs">geniuspro-superintelligence-v1</code>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">200K tokens</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Smart router that automatically selects the best model for each task. Optimized for complex reasoning, analysis, and general-purpose tasks.</p>
            </div>
            <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <code className="text-green-600 dark:text-green-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs">geniuspro-coder-v1</code>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">32K tokens</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Optimized for coding tasks. Based on Qwen3-Coder. Best for code generation, debugging, and technical documentation.</p>
            </div>
            <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <code className="text-purple-500 dark:text-purple-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs">geniuspro-voice</code>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">N/A</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Voice synthesis and recognition. Optimized for audio processing, transcription, and text-to-speech tasks.</p>
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
                    Smart router that automatically selects the best model (including Opus 4.6, GPT-4o, etc.) for each task. Optimized for complex reasoning, analysis, and general-purpose tasks.
                  </td>
                </tr>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 lg:px-6 py-4">
                    <code className="text-green-600 dark:text-green-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">geniuspro-coder-v1</code>
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">32K tokens</td>
                  <td className="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400">
                    Optimized for coding tasks. Based on Qwen3-Coder. Best for code generation, debugging, and technical documentation.
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

        {/* Pricing */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            Pricing
          </h2>
          
          {/* Card layout for mobile, table for desktop */}
          <div className="space-y-3 sm:hidden">
            <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <code className="text-blue-500 dark:text-blue-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs">geniuspro-superintelligence-v1</code>
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <div><span className="text-gray-500 dark:text-gray-400">Input:</span> <span className="text-gray-600 dark:text-gray-300">$4.00/1M</span></div>
                <div><span className="text-gray-500 dark:text-gray-400">Output:</span> <span className="text-gray-600 dark:text-gray-300">$20.00/1M</span></div>
              </div>
            </div>
            <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <code className="text-green-600 dark:text-green-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs">geniuspro-coder-v1</code>
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <div><span className="text-gray-500 dark:text-gray-400">Input:</span> <span className="text-gray-600 dark:text-gray-300">$1.00/1M</span></div>
                <div><span className="text-gray-500 dark:text-gray-400">Output:</span> <span className="text-gray-600 dark:text-gray-300">$8.00/1M</span></div>
              </div>
            </div>
            <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <code className="text-purple-500 dark:text-purple-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs">geniuspro-voice</code>
              <div className="mt-3 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Per minute:</span> <span className="text-gray-600 dark:text-gray-300">$0.05</span>
              </div>
            </div>
          </div>

          <div className="hidden sm:block bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-x-auto">
            <table className="w-full min-w-[500px]">
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
                    <code className="text-blue-500 dark:text-blue-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">geniuspro-superintelligence-v1</code>
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">$4.00</td>
                  <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">$20.00</td>
                  <td className="px-4 lg:px-6 py-4 text-gray-400">—</td>
                </tr>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 lg:px-6 py-4">
                    <code className="text-green-600 dark:text-green-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">geniuspro-coder-v1</code>
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">$1.00</td>
                  <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300">$8.00</td>
                  <td className="px-4 lg:px-6 py-4 text-gray-400">—</td>
                </tr>
                <tr className="hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 lg:px-6 py-4">
                    <code className="text-purple-500 dark:text-purple-400 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">geniuspro-voice</code>
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-gray-400">—</td>
                  <td className="px-4 lg:px-6 py-4 text-gray-400">—</td>
                  <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">$0.05 / minute</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Rate Limits */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-blue-400" />
            Rate Limits
          </h2>
          
          <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              By default, API keys have a rate limit of <strong className="text-gray-900 dark:text-white">120 requests per minute (RPM)</strong>. 
              This limit applies per API key and helps ensure fair usage across all users.
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Rate limits can be adjusted for Pro and Enterprise plans. Contact support for custom rate limits.
            </p>
          </div>
        </section>

        {/* API Reference */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            API Reference
          </h2>
          
          <div className="space-y-4">
            <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded">POST</span>
                    <code className="text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-sm">/v1/chat/completions</code>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Create a chat completion. Supports streaming.</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">GET</span>
                    <code className="text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-sm">/v1/models</code>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">List available models.</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">GET</span>
                    <code className="text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-sm">/health</code>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Check API health status (no auth required).</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
