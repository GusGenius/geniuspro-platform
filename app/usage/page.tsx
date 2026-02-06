"use client";

import { useState } from "react";
import { BarChart3, Download, Calendar, Filter } from "lucide-react";

export default function UsagePage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedModel, setSelectedModel] = useState("all");

  // Mock usage data - will be replaced with real data
  const usageData = {
    totalTokens: 2545000,
    inputTokens: 1890000,
    outputTokens: 655000,
    totalRequests: 1323,
    avgLatency: 245,
  };

  const dailyUsage = [
    { date: "Feb 1", input: 120000, output: 45000 },
    { date: "Feb 2", input: 185000, output: 62000 },
    { date: "Feb 3", input: 145000, output: 48000 },
    { date: "Feb 4", input: 210000, output: 78000 },
    { date: "Feb 5", input: 165000, output: 55000 },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const maxUsage = Math.max(...dailyUsage.map((d) => d.input + d.output));

  return (
    <div className="min-h-full p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">Usage</h1>
            <p className="text-gray-400 mt-1">Monitor your API usage and token consumption</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-medium rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last 7 days</option>
              <option value="month">This month</option>
              <option value="quarter">Last 3 months</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Models</option>
              <option value="geniuspro-coder-v1">geniuspro-coder-v1</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">Total Tokens</div>
            <div className="text-2xl font-semibold text-white">{formatNumber(usageData.totalTokens)}</div>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">Input Tokens</div>
            <div className="text-2xl font-semibold text-blue-400">{formatNumber(usageData.inputTokens)}</div>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">Output Tokens</div>
            <div className="text-2xl font-semibold text-green-400">{formatNumber(usageData.outputTokens)}</div>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">Total Requests</div>
            <div className="text-2xl font-semibold text-white">{formatNumber(usageData.totalRequests)}</div>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">Avg Latency</div>
            <div className="text-2xl font-semibold text-white">{usageData.avgLatency}ms</div>
          </div>
        </div>

        {/* Usage Chart */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-6">Token Usage</h2>
          
          {/* Simple Bar Chart */}
          <div className="space-y-4">
            {dailyUsage.map((day) => {
              const total = day.input + day.output;
              const inputPercent = (day.input / maxUsage) * 100;
              const outputPercent = (day.output / maxUsage) * 100;
              
              return (
                <div key={day.date} className="flex items-center gap-4">
                  <div className="w-16 text-sm text-gray-400">{day.date}</div>
                  <div className="flex-1 h-8 bg-gray-900 rounded-lg overflow-hidden flex">
                    <div
                      className="h-full bg-blue-500/70"
                      style={{ width: `${inputPercent}%` }}
                      title={`Input: ${formatNumber(day.input)}`}
                    />
                    <div
                      className="h-full bg-green-500/70"
                      style={{ width: `${outputPercent}%` }}
                      title={`Output: ${formatNumber(day.output)}`}
                    />
                  </div>
                  <div className="w-20 text-sm text-gray-400 text-right">
                    {formatNumber(total)}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="flex gap-6 mt-6 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500/70 rounded" />
              <span className="text-sm text-gray-400">Input Tokens</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500/70 rounded" />
              <span className="text-sm text-gray-400">Output Tokens</span>
            </div>
          </div>
        </div>

        {/* Usage by API Key */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Usage by API Key</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                  <th className="pb-3 font-medium">Key</th>
                  <th className="pb-3 font-medium">Requests</th>
                  <th className="pb-3 font-medium">Input Tokens</th>
                  <th className="pb-3 font-medium">Output Tokens</th>
                  <th className="pb-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-gray-700/50">
                  <td className="py-4">
                    <code className="text-gray-300 bg-gray-900 px-2 py-1 rounded">sk-gp-a1b2c3...</code>
                  </td>
                  <td className="py-4 text-gray-300">1,234</td>
                  <td className="py-4 text-blue-400">1.89M</td>
                  <td className="py-4 text-green-400">655K</td>
                  <td className="py-4 text-white font-medium">2.55M</td>
                </tr>
                <tr>
                  <td className="py-4">
                    <code className="text-gray-300 bg-gray-900 px-2 py-1 rounded">sk-gp-x9y8z7...</code>
                  </td>
                  <td className="py-4 text-gray-300">89</td>
                  <td className="py-4 text-blue-400">35K</td>
                  <td className="py-4 text-green-400">10K</td>
                  <td className="py-4 text-white font-medium">45K</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
