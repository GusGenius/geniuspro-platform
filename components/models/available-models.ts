export type ModelOption = { id: string; label: string };

export const AVAILABLE_MODELS: ModelOption[] = [
  { id: "geniuspro-agi-1.2", label: "Superintelligence" },
  { id: "geniuspro-code-agi-1.2", label: "Coding Superintelligence" },
  { id: "gemini-3-pro", label: "Gemini 3 Pro" },
  { id: "gemini-3-flash", label: "Gemini 3 Flash" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { id: "gemini-nano-banana", label: "Gemini Nano Banana (Image)" },
  { id: "gemini-nano-banana-pro", label: "Gemini Nano Banana Pro (Image)" },
  { id: "claude-opus-4.6", label: "Claude Opus 4.6" },
  { id: "claude-sonnet-4.5", label: "Claude Sonnet 4.5" },
  { id: "claude-haiku-4.5", label: "Claude Haiku 4.5" },
  { id: "gpt-5.2", label: "GPT 5.2" },
  { id: "gpt-5.3-codex", label: "GPT 5.3 Codex" },
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "gpt-4o-mini", label: "GPT-4o Mini" },
  { id: "deepseek-v3", label: "DeepSeek V3" },
  { id: "minimax-m2.5", label: "MiniMax M2.5" },
  { id: "mistral-large-3", label: "Mistral Large 3" },
  { id: "sam3", label: "SAM 3" },
];

export function getModelLabel(id: string): string {
  return AVAILABLE_MODELS.find((m) => m.id === id)?.label ?? id;
}

