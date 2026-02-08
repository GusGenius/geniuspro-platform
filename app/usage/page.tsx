"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart3, Calendar, ChevronDown, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";
import { calculateCost, formatCost, PRICING } from "@/lib/pricing";

/** Map raw model IDs to branded display names */
function getModelLabel(model: string): string {
  const pricing = PRICING[model as keyof typeof PRICING];
  if (pricing) return pricing.label;
  return "Superintelligence";
}

interface UsageStats {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalRequests: number;
  avgLatencyMs: number;
  totalCost: number;
}

interface DailyUsage {
  date: string;
  prompt: number;
  completion: number;
  cost: number;
}

interface ModelBreakdown {
  model: string;
  requests: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  avgLatencyMs: number;
  cost: number;
}

interface KeyBreakdown {
  keyId: string;
  keyName: string;
  keyPrefix: string;
  requests: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
}

type Period = "week" | "month" | "quarter";

function getPeriodStart(period: Period): string {
  const now = new Date();
  if (period === "week") now.setDate(now.getDate() - 7);
  else if (period === "month") now.setDate(1);
  else now.setMonth(now.getMonth() - 3);
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
    totalTokens: 0, promptTokens: 0, completionTokens: 0, totalRequests: 0, avgLatencyMs: 0, totalCost: 0,
  });
  const [daily, setDaily] = useState<DailyUsage[]>([]);
  const [models, setModels] = useState<ModelBreakdown[]>([]);
  const [keys, setKeys] = useState<KeyBreakdown[]>([]);

  const fetchUsage = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const since = getPeriodStart(period);
      const { data: rows, error } = await supabase
        .from("usage_logs")
        .select("model, prompt_tokens, completion_tokens, total_tokens, response_time_ms, created_at, api_key_id")
        .eq("user_id", user.id)
        .gte("created_at", since)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Failed to fetch usage:", error);
        setLoading(false);
        return;
      }

      if (!rows || rows.length === 0) {
        setStats({ totalTokens: 0, promptTokens: 0, completionTokens: 0, totalRequests: 0, avgLatencyMs: 0, totalCost: 0 });
        setDaily([]);
        setModels([]);
        setKeys([]);
        setLoading(false);
        return;
      }

      // Fetch API key names
      const keyIds = [...new Set(rows.map((r) => r.api_key_id).filter(Boolean))];
      const { data: keyData } = await supabase
        .from("api_keys")
        .select("id, name, key_prefix")
        .in("id", keyIds);
      const keyLookup = new Map(keyData?.map((k) => [k.id, k]) || []);

      let totalTokens = 0, promptTokens = 0, completionTokens = 0;
      let totalLatency = 0, latencyCount = 0, totalCost = 0;
      const dailyMap = new Map<string, { prompt: number; completion: number; cost: number }>();
      const modelMap = new Map<string, ModelBreakdown>();
      const keyUsageMap = new Map<string, KeyBreakdown>();

      for (const row of rows) {
        const pt = row.prompt_tokens ?? 0;
        const ct = row.completion_tokens ?? 0;
        const tt = row.total_tokens ?? 0;
        const lat = row.response_time_ms ?? 0;
        const model = row.model ?? "unknown";
        const cost = calculateCost(model, pt, ct);

        totalTokens += tt;
        promptTokens += pt;
        completionTokens += ct;
        totalCost += cost;
        if (lat > 0) { totalLatency += lat; latencyCount++; }

        const dayKey = new Date(row.created_at).toISOString().slice(0, 10);
        const day = dailyMap.get(dayKey) || { prompt: 0, completion: 0, cost: 0 };
        day.prompt += pt;
        day.completion += ct;
        day.cost += cost;
        dailyMap.set(dayKey, day);

        const m = modelMap.get(model) || {
          model, requests: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0, avgLatencyMs: 0, cost: 0,
        };
        m.requests++;
        m.promptTokens += pt;
        m.completionTokens += ct;
        m.totalTokens += tt;
        m.avgLatencyMs += lat;
        m.cost += cost;
        modelMap.set(model, m);

        if (row.api_key_id) {
          const k = keyUsageMap.get(row.api_key_id) || {
            keyId: row.api_key_id,
            keyName: keyLookup.get(row.api_key_id)?.name || "Unknown",
            keyPrefix: keyLookup.get(row.api_key_id)?.key_prefix || "...",
            requests: 0,
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            cost: 0,
          };
          k.requests++;
          k.promptTokens += pt;
          k.completionTokens += ct;
          k.totalTokens += tt;
          k.cost += cost;
          keyUsageMap.set(row.api_key_id, k);
        }
      }

      for (const entry of modelMap.values()) {
        if (entry.requests > 0) entry.avgLatencyMs = Math.round(entry.avgLatencyMs / entry.requests);
      }

      setStats({
        totalTokens, promptTokens, completionTokens,
        totalRequests: rows.length,
        avgLatencyMs: latencyCount > 0 ? Math.round(totalLatency / latencyCount) : 0,
        totalCost,
      });
      setDaily(Array.from(dailyMap.entries()).map(([date, d]) => ({ date, ...d })));
      setModels(Array.from(modelMap.values()).sort((a, b) => b.totalTokens - a.totalTokens));
      setKeys(Array.from(keyUsageMap.values()).sort((a, b) => b.totalTokens - a.totalTokens));
    } catch (err) {
      console.error("Failed to fetch usage:", err);
    } finally {
      setLoading(false);
    }
  }, [user, period]);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  const maxDaily = Math.max(...daily.map((d) => d.prompt + d.completion), 1);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 sm:p-6 md:p-10 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Usage</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">Monitor your API usage and token consumption</p>
        </div>

        {/* Period Filter */}
        <div className="flex items-center gap-2 mb-8">
          <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="appearance-none pl-3 pr-9 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="week">Last 7 days</option>
              <option value="month">This month</option>
              <option value="quarter">Last 3 months</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          <StatCard label="Total Tokens" value={formatNumber(stats.totalTokens)} />
          <StatCard label="Input Tokens" value={formatNumber(stats.promptTokens)} valueClass="text-blue-400" />
          <StatCard label="Output Tokens" value={formatNumber(stats.completionTokens)} valueClass="text-green-400" />
          <StatCard label="Requests" value={formatNumber(stats.totalRequests)} />
          <StatCard label="Avg Latency" value={`${formatNumber(stats.avgLatencyMs)}ms`} />
          <StatCard label="Total Cost" value={formatCost(stats.totalCost)} valueClass="text-purple-400" />
        </div>

        {/* Daily Chart */}
        {daily.length > 0 && (
          <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Daily Token Usage</h2>
            <div className="space-y-3">
              {daily.map((day) => (
                <div key={day.date} className="flex items-center gap-2 sm:gap-4">
                  <div className="w-12 sm:w-16 text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">{formatDate(day.date)}</div>
                  <div className="flex-1 h-7 bg-gray-200 dark:bg-gray-900 rounded-lg overflow-hidden flex">
                    <div className="h-full bg-blue-500/70 transition-all" style={{ width: `${(day.prompt / maxDaily) * 100}%` }} title={`Input: ${formatNumber(day.prompt)}`} />
                    <div className="h-full bg-green-500/70 transition-all" style={{ width: `${(day.completion / maxDaily) * 100}%` }} title={`Output: ${formatNumber(day.completion)}`} />
                  </div>
                  <div className="w-14 sm:w-20 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-right flex-shrink-0">{formatNumber(day.prompt + day.completion)}</div>
                  <div className="hidden sm:block w-20 text-sm text-purple-400 text-right flex-shrink-0 font-medium">{formatCost(day.cost)}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 sm:gap-6 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500/70 rounded" />
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Input</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500/70 rounded" />
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Output</span>
              </div>
            </div>
          </div>
        )}

        {/* Usage by API Key */}
        {keys.length > 0 && (
          <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Usage by API Key</h2>
            <div className="-mx-4 sm:mx-0 overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="text-left text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 pl-4 sm:pl-0 font-medium">Key</th>
                    <th className="pb-3 font-medium">Requests</th>
                    <th className="pb-3 font-medium">Input</th>
                    <th className="pb-3 font-medium">Output</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 pr-4 sm:pr-0 font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {keys.map((k, i) => (
                    <tr key={k.keyId} className={i < keys.length - 1 ? "border-b border-gray-200/50 dark:border-gray-700/50" : ""}>
                      <td className="py-3 sm:py-4 pl-4 sm:pl-0">
                        <div>
                          <div className="text-gray-900 dark:text-white font-medium">{k.keyName}</div>
                          <code className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-900 px-2 py-0.5 rounded">{k.keyPrefix}</code>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 text-gray-600 dark:text-gray-300">{formatNumber(k.requests)}</td>
                      <td className="py-3 sm:py-4 text-blue-400">{formatNumber(k.promptTokens)}</td>
                      <td className="py-3 sm:py-4 text-green-400">{formatNumber(k.completionTokens)}</td>
                      <td className="py-3 sm:py-4 text-gray-900 dark:text-white font-medium">{formatNumber(k.totalTokens)}</td>
                      <td className="py-3 sm:py-4 pr-4 sm:pr-0 text-purple-400 font-medium">{formatCost(k.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Model Breakdown */}
        {models.length > 0 && (
          <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Usage by Model</h2>
            <div className="-mx-4 sm:mx-0 overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr className="text-left text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 pl-4 sm:pl-0 font-medium">Model</th>
                    <th className="pb-3 font-medium">Requests</th>
                    <th className="pb-3 font-medium">Input</th>
                    <th className="pb-3 font-medium">Output</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Cost</th>
                    <th className="pb-3 pr-4 sm:pr-0 font-medium">Avg Latency</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {models.map((m, i) => (
                    <tr key={m.model} className={i < models.length - 1 ? "border-b border-gray-200/50 dark:border-gray-700/50" : ""}>
                      <td className="py-3 sm:py-4 pl-4 sm:pl-0"><code className="text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap">{getModelLabel(m.model)}</code></td>
                      <td className="py-3 sm:py-4 text-gray-600 dark:text-gray-300">{formatNumber(m.requests)}</td>
                      <td className="py-3 sm:py-4 text-blue-400">{formatNumber(m.promptTokens)}</td>
                      <td className="py-3 sm:py-4 text-green-400">{formatNumber(m.completionTokens)}</td>
                      <td className="py-3 sm:py-4 text-gray-900 dark:text-white font-medium">{formatNumber(m.totalTokens)}</td>
                      <td className="py-3 sm:py-4 text-purple-400 font-medium">{formatCost(m.cost)}</td>
                      <td className="py-3 sm:py-4 pr-4 sm:pr-0 text-gray-500 dark:text-gray-400">{formatNumber(m.avgLatencyMs)}ms</td>
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
            <p className="text-gray-400 dark:text-gray-500">Make API requests and your usage will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, valueClass = "text-gray-900 dark:text-white" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-5">
      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 truncate">{label}</div>
      <div className={`text-lg sm:text-2xl font-semibold truncate ${valueClass}`}>{value}</div>
    </div>
  );
}
