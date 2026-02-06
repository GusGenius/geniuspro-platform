"use client";

import { useState } from "react";
import { BookOpen, Copy, Check, ExternalLink, Code, Zap, Terminal } from "lucide-react";

export default function DocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const curlExample = `curl https://api.geniuspro.io/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "geniuspro-coder-v1",
    "messages": [
      {"role": "user", "content": "Write hello world in Python"}
    ]
  }'`;

  const pythonExample = `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.geniuspro.io/v1"
)

response = client.chat.completions.create(
    model="geniuspro-coder-v1",
    messages=[
        {"role": "user", "content": "Write hello world in Python"}
    ]
)

print(response.choices[0].message.content)`;

  const jsExample = `import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'YOUR_API_KEY',
  baseURL: 'https://api.geniuspro.io/v1',
});

const response = await openai.chat.completions.create({
  model: 'geniuspro-coder-v1',
  messages: [
    { role: 'user', content: 'Write hello world in Python' }
  ],
});

console.log(response.choices[0].message.content);`;

  return (
    <div className="min-h-full p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Documentation</h1>
          <p className="text-gray-400 mt-1">Learn how to integrate with the GeniusPro API</p>
        </div>

        {/* Quick Start */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Quick Start
          </h2>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
            <p className="text-gray-300">
              GeniusPro API is OpenAI-compatible. You can use the official OpenAI SDKs by simply changing the base URL.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Base URL</div>
                <code className="text-blue-400">https://api.geniuspro.io/v1</code>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Model</div>
                <code className="text-green-400">geniuspro-coder-v1</code>
              </div>
            </div>
          </div>
        </section>

        {/* Authentication */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-400" />
            Authentication
          </h2>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-300 mb-4">
              Authenticate using your API key in the Authorization header:
            </p>
            
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
              <span className="text-gray-500">Authorization:</span>{" "}
              <span className="text-green-400">Bearer</span>{" "}
              <span className="text-blue-400">YOUR_API_KEY</span>
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-purple-400" />
            Code Examples
          </h2>
          
          <div className="space-y-6">
            {/* cURL */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <span className="text-sm font-medium text-gray-300">cURL</span>
                <button
                  onClick={() => copyCode(curlExample, "curl")}
                  className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedCode === "curl" ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm">
                <code className="text-gray-300">{curlExample}</code>
              </pre>
            </div>

            {/* Python */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <span className="text-sm font-medium text-gray-300">Python</span>
                <button
                  onClick={() => copyCode(pythonExample, "python")}
                  className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedCode === "python" ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm">
                <code className="text-gray-300">{pythonExample}</code>
              </pre>
            </div>

            {/* JavaScript */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <span className="text-sm font-medium text-gray-300">JavaScript / TypeScript</span>
                <button
                  onClick={() => copyCode(jsExample, "js")}
                  className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedCode === "js" ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm">
                <code className="text-gray-300">{jsExample}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-400" />
            API Reference
          </h2>
          
          <div className="space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded">POST</span>
                    <code className="text-white">/v1/chat/completions</code>
                  </div>
                  <p className="text-gray-400 text-sm">Create a chat completion. Supports streaming.</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">GET</span>
                    <code className="text-white">/v1/models</code>
                  </div>
                  <p className="text-gray-400 text-sm">List available models.</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">GET</span>
                    <code className="text-white">/health</code>
                  </div>
                  <p className="text-gray-400 text-sm">Check API health status (no auth required).</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Model Info */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Available Models</h2>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                  <th className="px-6 py-4 font-medium">Model</th>
                  <th className="px-6 py-4 font-medium">Context</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-6 py-4">
                    <code className="text-blue-400">geniuspro-coder-v1</code>
                  </td>
                  <td className="px-6 py-4 text-gray-300">32K tokens</td>
                  <td className="px-6 py-4 text-gray-400">Optimized for coding tasks. Based on Qwen3-Coder.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
