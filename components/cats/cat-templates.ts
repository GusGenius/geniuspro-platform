import type { CatTemplate } from "@/components/cats/types";

const DEFAULT_MODEL = "gemini-3-flash";

export const CAT_TEMPLATES: CatTemplate[] = [
  {
    id: "research-write",
    label: "Research + Write",
    description: "Find facts, then write a clean final response.",
    defaultName: "Research + Writer",
    defaultDescription: "Research the topic, then write a final answer.",
    kittens: [
      {
        name: "Researcher",
        model_id: DEFAULT_MODEL,
        instructions: [
          "Goal: gather the key facts and constraints.",
          "Output:",
          "- Bullet points only",
          "- Include assumptions and unknowns",
          "- Keep it short",
        ].join("\n"),
      },
      {
        name: "Writer",
        model_id: DEFAULT_MODEL,
        instructions: [
          "Goal: write the final response to the user.",
          "Use the Researcher's bullets as your source of truth.",
          "Be concise, correct, and actionable.",
        ].join("\n"),
      },
    ],
  },
  {
    id: "code-review",
    label: "Code + Review",
    description: "Generate an implementation, then review it for bugs/risk.",
    defaultName: "Code + Reviewer",
    defaultDescription: "Implement changes, then review for correctness and risk.",
    kittens: [
      {
        name: "Coder",
        model_id: DEFAULT_MODEL,
        instructions: [
          "Goal: propose an implementation plan or code changes.",
          "Prefer simple, readable solutions.",
        ].join("\n"),
      },
      {
        name: "Reviewer",
        model_id: DEFAULT_MODEL,
        instructions: [
          "Goal: review the previous output for correctness and risks.",
          "Point out edge cases, regressions, and missing tests.",
          "Suggest improvements with minimal changes.",
        ].join("\n"),
      },
    ],
  },
  {
    id: "extract-validate",
    label: "Extract + Validate",
    description: "Extract structured data, then validate it.",
    defaultName: "Extractor + Validator",
    defaultDescription: "Extract structured fields, then validate for completeness.",
    kittens: [
      {
        name: "Extractor",
        model_id: DEFAULT_MODEL,
        instructions: [
          "Goal: extract the key fields from the user's input.",
          "Output JSON only.",
          "Do not include extra prose.",
        ].join("\n"),
      },
      {
        name: "Validator",
        model_id: DEFAULT_MODEL,
        instructions: [
          "Goal: validate extracted JSON for missing/invalid fields.",
          "Output:",
          "- validation_errors: string[]",
          "- corrected_json: object",
        ].join("\n"),
      },
    ],
  },
  {
    id: "general",
    label: "General",
    description: "A single-kitten cat for simple tasks.",
    defaultName: "General Cat",
    defaultDescription: "A general purpose cat.",
    kittens: [
      {
        name: "Helper",
        model_id: DEFAULT_MODEL,
        instructions: "Be helpful, correct, and concise.",
      },
    ],
  },
];

export function getCatTemplate(id: string): CatTemplate | null {
  return CAT_TEMPLATES.find((t) => t.id === id) ?? null;
}

