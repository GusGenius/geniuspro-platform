export type RouterStepInstructions = {
  /** 1-based step index in the pipeline. */
  index: number;
  /** Model id, if known. Stored lowercased in API. */
  modelId: string;
  instructions: string;
};

export type ParsedRouterInstructions = {
  /** Applied to all steps (and fallback attempts). */
  global: string;
  /** Optional per-step instructions (pipeline only). */
  steps: RouterStepInstructions[];
};

/**
 * We store structured router instructions inside the existing single `instructions` column.
 * This avoids DB migrations and keeps backwards compatibility.
 *
 * Format:
 * [router]
 * <global>
 * [/router]
 *
 * [step index="1" model="gemini-3-flash"]
 * <step instructions>
 * [/step]
 */
const ROUTER_BLOCK_OPEN = "[router]";
const ROUTER_BLOCK_CLOSE = "[/router]";

function stripOuterWhitespace(s: string): string {
  return s.replace(/^\s+|\s+$/g, "");
}

function parseAttributes(attrs: string): Record<string, string> {
  const out: Record<string, string> = {};
  // Matches key="value" pairs; tolerant of extra whitespace.
  const re = /([a-zA-Z_][a-zA-Z0-9_-]*)\s*=\s*"([^"]*)"/g;
  for (const match of attrs.matchAll(re)) {
    const key = match[1];
    const value = match[2] ?? "";
    if (!key) continue;
    out[key] = value;
  }
  return out;
}

function removeAllBlocks(raw: string, blocks: Array<{ open: RegExp; close: string }>): string {
  let next = raw;
  for (const b of blocks) {
    // Remove greedy blocks safely with a non-greedy match to the closing tag.
    const re = new RegExp(`${b.open.source}[\\s\\S]*?${b.close.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "g");
    next = next.replace(re, "");
  }
  return next;
}

export function parseRouterInstructions(raw: string): ParsedRouterInstructions {
  const input = typeof raw === "string" ? raw : "";
  const trimmed = stripOuterWhitespace(input);
  const looksStructured =
    trimmed.includes(ROUTER_BLOCK_OPEN) || trimmed.includes("[step");

  if (!looksStructured) {
    return { global: trimmed, steps: [] };
  }

  // Router block (global) — if missing, fall back to "everything except step blocks".
  let global = "";
  const routerOpenIdx = trimmed.indexOf(ROUTER_BLOCK_OPEN);
  const routerCloseIdx = trimmed.indexOf(ROUTER_BLOCK_CLOSE);
  if (routerOpenIdx !== -1 && routerCloseIdx !== -1 && routerCloseIdx > routerOpenIdx) {
    global = stripOuterWhitespace(
      trimmed.slice(routerOpenIdx + ROUTER_BLOCK_OPEN.length, routerCloseIdx)
    );
  } else {
    global = stripOuterWhitespace(
      removeAllBlocks(trimmed, [{ open: /\[step[^\]]*\]/, close: "[/step]" }])
    );
  }

  const steps: RouterStepInstructions[] = [];
  const stepRe = /\[step([^\]]*)\]([\s\S]*?)\[\/step\]/g;
  for (const match of trimmed.matchAll(stepRe)) {
    const attrsRaw = match[1] ?? "";
    const bodyRaw = match[2] ?? "";
    const attrs = parseAttributes(attrsRaw);

    const index = Number.parseInt(attrs.index ?? "", 10);
    const modelId = stripOuterWhitespace(attrs.model ?? "").toLowerCase();
    const instructions = stripOuterWhitespace(bodyRaw);

    if (!Number.isFinite(index) || index <= 0) continue;
    if (!modelId) continue;
    if (!instructions) continue;

    steps.push({ index, modelId, instructions });
  }

  // Ensure deterministic order.
  steps.sort((a, b) => a.index - b.index);
  return { global, steps };
}

export function serializeRouterInstructions(input: ParsedRouterInstructions): string {
  const global = stripOuterWhitespace(input.global ?? "");
  const steps = Array.isArray(input.steps) ? input.steps : [];

  const cleanedSteps = steps
    .map((s) => ({
      index: s.index,
      modelId: stripOuterWhitespace(s.modelId ?? "").toLowerCase(),
      instructions: stripOuterWhitespace(s.instructions ?? ""),
    }))
    .filter((s) => Number.isFinite(s.index) && s.index > 0 && s.modelId && s.instructions)
    .sort((a, b) => a.index - b.index);

  // If there are no step instructions, keep the legacy behavior: store plain text.
  if (cleanedSteps.length === 0) return global;

  let out = "";
  out += `${ROUTER_BLOCK_OPEN}\n${global}\n${ROUTER_BLOCK_CLOSE}\n`;
  for (const step of cleanedSteps) {
    out += `\n[step index="${step.index}" model="${step.modelId}"]\n`;
    out += `${step.instructions}\n`;
    out += `[/step]\n`;
  }
  return stripOuterWhitespace(out);
}

