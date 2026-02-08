"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart3, Calendar, Filter, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";

interface UsageStats {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalRequests: number;
  avgLatencyMs: number;
}

interface DailyUsage {
  date: string;
  prompt: number;
  completion: number;
}

interface ModelBreakdown {
  model: string;
  requests: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  avgLatencyMs: number;
}

type Period = "week" | "month" | "quarter";

function getPeriodStart(period: Period): string {
  const now = new Date();
  if (period === "week") {
    now.setDate(now.getDate() - 7);
  } else if (period === "month") {
    now.setDate(1);
  } else {
    now.setMonth(now.getMonth() - 3);
  }
  return now.toISOString();
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function UsagePage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>("month");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UsageStats>({
    totalTokens: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalRequests: 0,
    avgLatencyMs: 0,
  });
  const [daily, setDaily] = useState<DailyUsage[]>([]);
  const [models, setModels] = useState<ModelBreakdown[]>([]);

  const fetchUsage = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const since = getPeriodStart(period);

      const { data: rows, error } = await supabase
        .from("usage_logs")
        .select("model, prompt_tokens, completion_tokens, total_tokens, response_time_ms, created_at")
        .eq("user_id", user.id)
        .gte("created_at", since)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Failed to fetch usage:", error);
        setLoading(false);
        return;
      }

      if (!rows || rows.length === 0) {
        setStats({ totalTokens: 0, promptTokens: 0, completionTokens: 0, totalRequests: 0, avgLatencyMs: 0 });
        setDaily([]);
        setModels([]);
        setLoading(false);
        return;
      }

      let totalTokens = 0;
      let promptTokens = 0;
      let completionTokens = 0;
      let totalLatency = 0;
      let latencyCount = 0;

      const dailyMap = new Map<string, { prompt: number; completion: number }>();
      const modelMap = new Map<string, ModelBreakdown>();

      for (const row of rows) {
        const pt = row.prompt_tokens ?? 0;
        const ct = row.completion_tokens ?? 0;
        const tt = row.total_tokens ?? 0;
        const lat = row.response_time_ms ?? 0;
        const model = row.model ?? "unknown";

        totalTokens += tt;
        promptTokens += pt;
        completionTokens += ct;
        if (lat > 0) {
          totalLatency += lat;
          latencyCount++;
        }

        const dayKey = new Date(row.created_at).toISOString().slice(0, 10);
        const dayEntry = dailyMap.get(dayKey) || { prompt: 0, completion: 0 };
        dayEntry.prompt += pt;
        dayEntry.completion += ct;
        dailyMap.set(dayKey, dayEntry);

        const modelEntry = modelMap.get(model) || {
          model,
          requests: 0,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          avgLatencyMs: 0,
        };
        modelEntry.requests++;
        modelEntry.promptTokens += pt;
        modelEntry.completionTokens += ct;
        modelEntry.totalTokens += tt;
        modelEntry.avgLatencyMs += lat;
        modelMap.set(model, modelEntry);
      }

      for (const entry of modelMap.values()) {
        if (entry.requests > 0) {
          entry.avgLatencyMs = Math.round(entry.avgLatencyMs / entry.requests);
        }
      }

      setStats({
        totalTokens,
        promptTokens,
        completionTokens,
        totalRequests: rows.length,
        avgLatencyMs: latencyCount > 0 ? Math.round(totalLatency / latencyCount) : 0,
      });

      setDaily(
        Array.from(dailyMap.entries()).map(([date, d]) => ({
          date,
          prompt: d.prompt,
          completion: d.completion,
        }))
      );

      setModels(
        Array.from(modelMap.values()).sort((a, b) => b.totalTokens - a.totalTokens)
      );
    } catch (err) {
      console.error("Failed to fetch usage:", err);
    } finally {
      setLoading(false);
    }
  }, [user, period]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const maxDaily = Math.max(...daily.map((d) => d.prompt + d.completion), 1);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Usage</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Monitor your API usage and token consumption
            </p>
          </div>
        </div>

        {/* Period Filter */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last 7 days</option>
              <option value="month">This month</option>
              <option value="quarter">Last 3 months</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Tokens" value={formatNumber(stats.totalTokens)} />
          <StatCard label="Input Tokens" value={formatNumber(stats.promptTokens)} valueClass="text-blue-400" />
          <StatCard label="Output Tokens" value={formatNumber(stats.completionTokens)} valueClass="text-green-400" />
          <StatCard label="Requests" value={formatNumber(stats.totalRequests)} />
          <StatCard label="Avg Latency" value={`${formatNumber(stats.avgLatencyMs)}ms`} />
        </div>

        {/* Daily Chart */}
        {daily.length > 0 && (
          <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Daily Token Usage
            </h2>
            <div className="space-y-3">
              {daily.map((day) => {
                const promptPct = (day.prompt / maxDaily) * 100;
                const compPct = (day.completion / maxDaily) * 100;
                return (
                  <div key={day.date} className="flex items-center gap-4">
                    <div className="w-16 text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {formatDate(day.date)}
                    </div>
                    <div className="flex-1 h-7 bg-gray-200 dark:bg-gray-900 rounded-lg overflow-hidden flex">
                      <div
                        className="h-full bg-blue-500/70 transition-all"
                        style={{ width: `${promptPct}%` }}
                        title={`Input: ${formatNumber(day.prompt)}`}
                      />
                      <div
                        className="h-full bg-green-500/70 transition-all"
                        style={{ width: `${compPct}%` }}
                        title={`Output: ${formatNumber(day.completion)}`}
                      />
                    </div>
                    <div className="w-20 text-sm text-gray-500 dark:text-gray-400 text-right flex-shrink-0">
                      {formatNumber(day.prompt + day.completion)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-6 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500/70 rounded" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Input Tokens</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500/70 rounded" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Output Tokens</span>
              </div>
            </div>
          </div>
        )}

        {/* Model Breakdown */}
        {models.length > 0 && (
          <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Usage by Model
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 font-medium">Model</th>
                    <th className="pb-3 font-medium">Requests</th>
                    <th className="pb-3 font-medium">Input</th>
                    <th className="pb-3 font-medium">Output</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Avg Latency</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {models.map((m, i) => (
                    <tr
                      key={m.model}
                      className={i < models.length - 1 ? "border-b border-gray-200/50 dark:border-gray-700/50" : ""}
                    >
                      <td className="py-4">
                        <code className="text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs">
                          {m.model}
                        </code>
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-300">{formatNumber(m.requests)}</td>
                      <td className="py-4 text-blue-400">{formatNumber(m.promptTokens)}</td>
                      <td className="py-4 text-green-400">{formatNumber(m.completionTokens)}</td>
                      <td className="py-4 text-gray-900 dark:text-white font-medium">{formatNumber(m.totalTokens)}</td>
                      <td className="py-4 text-gray-500 dark:text-gray-400">{formatNumber(m.avgLatencyMs)}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {stats.totalRequests === 0 && (
          <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">No usage yet</h3>
            <p className="text-gray-400 dark:text-gray-500">
              Make API requests and your usage will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  valueClass = "text-gray-900 dark:text-white",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</div>
      <div className={`text-2xl font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}
