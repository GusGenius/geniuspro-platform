import type {
  Sam3RouterStepsConfig,
  Sam3Target,
} from "@/components/routers/router-sam3-config";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function parseSam3ConfigFromRouterSteps(
  raw: unknown
): Sam3RouterStepsConfig {
  if (!isRecord(raw)) {
    return { enabled: false, includeRaw: false, targets: [], blocksJson: "[]" };
  }
  const steps = raw.steps;
  if (!Array.isArray(steps)) {
    return { enabled: false, includeRaw: false, targets: [], blocksJson: "[]" };
  }

  let includeRaw = false;
  let targets: Sam3Target[] = [];
  const blocks: Array<Record<string, unknown>> = [];

  for (const step of steps) {
    if (!isRecord(step)) continue;
    const type = typeof step.type === "string" ? step.type : "";
    const cfg = isRecord(step.config) ? step.config : null;

    if (type === "vision_sam3" && cfg) {
      includeRaw = cfg.include_raw === true;
      const rawTargets = cfg.targets;
      if (Array.isArray(rawTargets)) {
        const parsed: Sam3Target[] = [];
        for (const t of rawTargets) {
          if (!isRecord(t)) continue;
          const name = typeof t.name === "string" ? t.name.trim() : "";
          const promptsRaw = t.prompts;
          const prompts = Array.isArray(promptsRaw)
            ? promptsRaw
                .filter(
                  (p): p is string => typeof p === "string" && p.trim().length > 0
                )
                .map((p) => p.trim())
            : [];
          if (!name || prompts.length === 0) continue;
          parsed.push({ name, prompts });
        }
        targets = parsed;
      }
    }

    if (type === "vision_postprocess" && cfg) {
      const rawBlocks = cfg.blocks;
      if (Array.isArray(rawBlocks)) {
        for (const b of rawBlocks) {
          if (isRecord(b)) blocks.push(b);
        }
      }
    }
  }

  return {
    enabled: targets.length > 0,
    includeRaw,
    targets,
    blocksJson: JSON.stringify(blocks, null, 2) || "[]",
  };
}

export function buildRouterStepsFromSam3Config(
  cfg: Sam3RouterStepsConfig
): { ok: true; value: unknown } | { ok: false; error: string } {
  if (!cfg.enabled) return { ok: true, value: null };

  const targets = cfg.targets
    .map((t) => ({
      name: t.name.trim(),
      prompts: t.prompts.map((p) => p.trim()).filter(Boolean),
    }))
    .filter((t) => t.name && t.prompts.length > 0)
    .slice(0, 25);

  if (targets.length === 0) {
    return {
      ok: false,
      error: "SAM 3 step enabled: add at least one target with prompts.",
    };
  }

  let blocksParsed: unknown = [];
  try {
    blocksParsed = cfg.blocksJson.trim() ? JSON.parse(cfg.blocksJson) : [];
  } catch {
    return { ok: false, error: "SAM 3 post-processing blocks JSON is invalid." };
  }
  if (!Array.isArray(blocksParsed)) {
    return {
      ok: false,
      error: "SAM 3 post-processing blocks must be a JSON array.",
    };
  }

  return {
    ok: true,
    value: {
      steps: [
        {
          type: "vision_sam3",
          config: {
            targets,
            include_raw: cfg.includeRaw,
          },
        },
        {
          type: "vision_postprocess",
          config: { blocks: blocksParsed.slice(0, 25) },
        },
      ],
    },
  };
}

