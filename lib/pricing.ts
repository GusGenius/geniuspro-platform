/**
 * GeniusPro API Pricing (per 1M tokens unless noted)
 * Undercuts Anthropic Opus 4.6 by $1/$5
 */

export const PRICING = {
  "GeniusPro-agi-1.2": {
    input: 4.0, // $4 per 1M input tokens
    output: 20.0, // $20 per 1M output tokens
    label: "Superintelligence",
    description: "Superintelligence (regular surface)",
  },
  "GeniusPro-coding-agi-1.2": {
    input: 4.0, // $4 per 1M input tokens
    output: 20.0, // $20 per 1M output tokens
    label: "Coding Superintelligence",
    description: "Coding Superintelligence (Cursor surface)",
  },
} as const;

/** Calculate cost for a request given model, input tokens, output tokens */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = PRICING[model as keyof typeof PRICING];
  if (!pricing) return 0;

  if ("perMinute" in pricing) {
    // Voice model - would need duration, but for now return 0
    return 0;
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

/** Format cost as currency string */
export function formatCost(cost: number): string {
  if (cost < 0.01) return "$0.00";
  if (cost < 1) return `$${cost.toFixed(3)}`;
  return `$${cost.toFixed(2)}`;
}

/** Get pricing for a model */
export function getModelPricing(model: string) {
  return PRICING[model as keyof typeof PRICING] || null;
}
