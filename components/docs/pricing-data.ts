/**
 * Pricing per 1M tokens (input/output) unless otherwise noted.
 * Voice: per minute. Source: OpenRouter/provider pricing (Feb 2026).
 */

export type PricingRow = {
  model: string;
  input: string;
  output: string;
  other?: string;
  color: string;
};

export const PRICING_ROWS: PricingRow[] = [
  // GeniusPro — smart routing
  { model: "geniuspro-agi-1.2", input: "~$0.28–0.30", output: "~$0.42–1.20", color: "text-blue-500 dark:text-blue-400", other: "Chat routing" },
  { model: "geniuspro-code-agi-1.2", input: "~$0.30–12", output: "~$1.20–48", color: "text-emerald-500 dark:text-emerald-400", other: "Coding routing" },
  // Anthropic
  { model: "claude-opus-4.6", input: "$5.00", output: "$25.00", color: "text-blue-500 dark:text-blue-400", other: "Flagship" },
  { model: "claude-sonnet-4.5", input: "$3.00", output: "$15.00", color: "text-blue-500 dark:text-blue-400" },
  { model: "claude-haiku-4.5", input: "$1.00", output: "$5.00", color: "text-blue-500 dark:text-blue-400", other: "Fast" },
  { model: "claude-sonnet-4", input: "$3.00", output: "$15.00", color: "text-blue-500 dark:text-blue-400" },
  { model: "claude-3-5-sonnet", input: "~$3.00", output: "~$15.00", color: "text-blue-500 dark:text-blue-400" },
  { model: "claude-3-opus", input: "~$15.00", output: "~$75.00", color: "text-blue-500 dark:text-blue-400" },
  // OpenAI
  { model: "gpt-5.2", input: "~$1.25", output: "~$10.00", color: "text-emerald-500 dark:text-emerald-400" },
  { model: "gpt-5.3-codex", input: "~$12.00", output: "~$48.00", color: "text-emerald-500 dark:text-emerald-400", other: "Coding" },
  { model: "gpt-5.3-codex-spark", input: "~$12.00", output: "~$48.00", color: "text-emerald-500 dark:text-emerald-400", other: "Coding" },
  { model: "gpt-5-codex", input: "~$12.00", output: "~$48.00", color: "text-emerald-500 dark:text-emerald-400", other: "Coding" },
  { model: "gpt-4o", input: "~$2.50", output: "~$10.00", color: "text-emerald-500 dark:text-emerald-400" },
  { model: "gpt-4o-mini", input: "$0.15", output: "$0.60", color: "text-emerald-500 dark:text-emerald-400", other: "Budget" },
  { model: "gpt-4-turbo", input: "~$10.00", output: "~$30.00", color: "text-emerald-500 dark:text-emerald-400" },
  // Google
  { model: "gemini-3-pro", input: "~$2.50", output: "~$15.00", color: "text-amber-500 dark:text-amber-400" },
  { model: "gemini-3-flash", input: "$0.50", output: "$3.00", color: "text-amber-500 dark:text-amber-400", other: "Fast" },
  { model: "gemini-2.5-pro", input: "$1.25", output: "$10.00", color: "text-amber-500 dark:text-amber-400" },
  { model: "gemini-2.0-flash", input: "$0.30", output: "$2.50", color: "text-amber-500 dark:text-amber-400", other: "Budget" },
  // DeepSeek
  { model: "deepseek-chat", input: "$0.30", output: "$1.20", color: "text-cyan-500 dark:text-cyan-400", other: "Cost-effective" },
  { model: "deepseek-reasoner", input: "$0.70", output: "$2.50", color: "text-cyan-500 dark:text-cyan-400", other: "Reasoning" },
  { model: "deepseek-v3", input: "$0.28", output: "$1.10", color: "text-cyan-500 dark:text-cyan-400", other: "V3" },
  // Moonshot
  { model: "kimi-k2.5", input: "~$0.60", output: "~$2.80", color: "text-violet-500 dark:text-violet-400" },
  { model: "kimi-k2", input: "$0.50", output: "$2.40", color: "text-violet-500 dark:text-violet-400" },
  // Mistral
  { model: "mistral-large-3", input: "$2.00", output: "$6.00", color: "text-green-500 dark:text-green-400" },
  { model: "mistral-large", input: "$2.00", output: "$6.00", color: "text-green-500 dark:text-green-400" },
  { model: "devstral-2", input: "~$2.00", output: "~$6.00", color: "text-green-500 dark:text-green-400", other: "Code agent" },
  // MiniMax
  { model: "minimax-m2.5", input: "$0.30", output: "$1.20", color: "text-amber-500 dark:text-amber-400", other: "Cost-effective" },
  { model: "minimax-m2.5-lightning", input: "~$0.15", output: "~$0.60", color: "text-amber-500 dark:text-amber-400", other: "Fast" },
  { model: "minimax-m2", input: "~$0.20", output: "~$0.80", color: "text-amber-500 dark:text-amber-400" },
];
