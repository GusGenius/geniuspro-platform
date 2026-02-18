"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";
import { ModelsOrderEditor } from "@/components/routers/models-order-editor";
import { AVAILABLE_MODELS } from "@/components/routers/available-models";
import {
  parseRouterInstructions,
  serializeRouterInstructions,
} from "@/components/routers/router-instructions";
import { RouterSam3Config } from "@/components/routers/router-sam3-config";
import type { Sam3RouterStepsConfig } from "@/components/routers/router-sam3-config";
import { RouterStepInstructions } from "@/components/routers/router-step-instructions";
import {
  normalizeModelIds,
  normalizeSlug,
  slugFromName,
} from "@/components/routers/router-form-utils";
import { parseSam3ConfigFromRouterSteps, buildRouterStepsFromSam3Config } from "@/components/routers/router-sam3-steps";
import { saveRouterToSupabase } from "@/components/routers/router-save";

export type RoutingMode = "fallback" | "pipeline";

export type RouterFormData = {
  name: string;
  slug: string;
  instructions: string;
  model_ids: string[];
  routing_mode: RoutingMode;
  router_steps?: unknown | null;
};

type Props = {
  mode: "create" | "edit";
  editingId?: string;
  initialData: RouterFormData;
  backHref: string;
  backLabel: string;
};

export function RouterForm({
  mode,
  editingId,
  initialData,
  backHref,
  backLabel,
}: Props) {
  const { user } = useAuth();
  const router = useRouter();

  const parsedInitialInstructions = useMemo(
    () => parseRouterInstructions(initialData.instructions),
    [initialData.instructions]
  );

  const [formName, setFormName] = useState(initialData.name);
  const [formSlug, setFormSlug] = useState(initialData.slug);
  const [formGlobalInstructions, setFormGlobalInstructions] = useState(
    parsedInitialInstructions.global
  );
  const [formStepInstructionsByModelId, setFormStepInstructionsByModelId] =
    useState<Record<string, string>>(() => {
      const out: Record<string, string> = {};
      for (const step of parsedInitialInstructions.steps) {
        if (!step.modelId) continue;
        out[step.modelId] = step.instructions;
      }
      return out;
    });
  const [formModelIds, setFormModelIds] = useState(initialData.model_ids);
  const [formRoutingMode, setFormRoutingMode] = useState<RoutingMode>(
    initialData.routing_mode ?? "fallback"
  );
  const [sam3Config, setSam3Config] = useState<Sam3RouterStepsConfig>(() =>
    parseSam3ConfigFromRouterSteps(initialData.router_steps)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (name: string) => {
    setFormName(name);
    if (mode === "create") setFormSlug(slugFromName(name));
  };

  const routerModelIdPreview = useMemo(() => {
    const slug = normalizeSlug(formSlug);
    return slug ? `router:${slug}` : "router:your-slug";
  }, [formSlug]);

  function setStepInstruction(modelId: string, next: string) {
    const key = modelId.trim().toLowerCase();
    setFormStepInstructionsByModelId((prev) => ({ ...prev, [key]: next }));
  }

  function fillPipelineTemplate() {
    // Keep it short: a global rule + per-step roles for common pipeline usage.
    if (!formGlobalInstructions.trim()) {
      setFormGlobalInstructions(
        [
          "You are a router workflow.",
          "Follow the step instructions. Do not skip steps.",
          "Output must match the last step's requirements.",
        ].join("\n")
      );
    }

    for (let i = 0; i < formModelIds.length; i++) {
      const modelId = formModelIds[i]?.trim().toLowerCase();
      if (!modelId) continue;
      const existing = formStepInstructionsByModelId[modelId]?.trim() ?? "";
      if (existing) continue;
      const step = i + 1;
      setStepInstruction(
        modelId,
        step === formModelIds.length
          ? [
              "FINAL STEP:",
              "Write the final answer for the user.",
              "Be concise and correct.",
            ].join("\n")
          : [
              `STEP ${step}:`,
              "Do the analysis for the next model.",
              "Return only your output for the next step (no extra chatter).",
            ].join("\n")
      );
    }
  }

  const handleSave = async () => {
    if (!user) return;
    const slug = normalizeSlug(formSlug);
    if (!slug) {
      setError("Slug is required (e.g. house-analysis)");
      return;
    }
    const cleanedModelIds = normalizeModelIds(formModelIds);
    if (cleanedModelIds.length === 0) {
      setError("Select at least one model.");
      return;
    }

    const builtSteps = buildRouterStepsFromSam3Config(sam3Config);
    if (!builtSteps.ok) {
      setError(builtSteps.error);
      return;
    }
    const routerSteps = builtSteps.value;

    setSaving(true);
    setError(null);
    try {
      const stepInstructions =
        formRoutingMode === "pipeline"
          ? cleanedModelIds.map((modelId, idx) => ({
              index: idx + 1,
              modelId,
              instructions:
                formStepInstructionsByModelId[modelId.trim().toLowerCase()] ?? "",
            }))
          : [];
      const hasStepInstructions = stepInstructions.some((s) => s.instructions.trim());

      const finalInstructions = hasStepInstructions
        ? serializeRouterInstructions({
            global: formGlobalInstructions.trim(),
            steps: stepInstructions,
          })
        : formGlobalInstructions.trim();

      const payloadBase = {
        user_id: user.id,
        slug,
        name: formName.trim() || slug,
        instructions: finalInstructions,
        model_id: cleanedModelIds[0],
        fallback_model_id: cleanedModelIds[1] ?? null,
        updated_at: new Date().toISOString(),
      };

      const saved = await saveRouterToSupabase({
        supabase,
        user,
        editingId,
        payloadBase,
        modelIds: cleanedModelIds,
        routingMode: formRoutingMode,
        routerSteps,
      });
      if (!saved.ok) {
        const msg = saved.error instanceof Error ? saved.error.message : String(saved.error ?? "Failed to save");
        // Preserve the duplicate-slug UX.
        if (msg.includes("23505") || msg.toLowerCase().includes("duplicate")) {
          setError("A router with this slug already exists");
          return;
        }
        throw saved.error;
      }

      router.push("/routers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {mode === "create" ? "Create Router" : "Edit Router"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {mode === "create"
              ? "Create a custom router with instructions and model selection."
              : "Update your router settings."}
          </p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <p className="text-blue-600 dark:text-blue-300 text-sm">
            Call this router via{" "}
            <code className="text-xs bg-gray-200 dark:bg-gray-800 px-1 rounded">
              model={routerModelIdPreview}
            </code>{" "}
            when using <code className="text-xs bg-gray-200 dark:bg-gray-800 px-1 rounded">/v1/chat/completions</code>.
          </p>
        </div>

        <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., House Analysis"
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Slug{" "}
                <span className="text-gray-400">
                  (used in <span className="font-mono">model=router:slug</span>)
                </span>
              </label>
              <input
                type="text"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="house-analysis"
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Router model ID:{" "}
                <code className="bg-gray-200 dark:bg-gray-900 px-1.5 py-0.5 rounded">
                  {routerModelIdPreview}
                </code>
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Router instructions{" "}
              <span className="text-gray-400">(added as system prompt)</span>
            </label>
            <textarea
              value={formGlobalInstructions}
              onChange={(e) => setFormGlobalInstructions(e.target.value)}
              placeholder="Define the assistant's behavior, output format, and constraints..."
              rows={5}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Applies to all models in the router. For Pipeline routing, you can
              also add optional step instructions per model.
            </p>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Routing strategy
            </label>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="routing_mode"
                  value="fallback"
                  checked={formRoutingMode === "fallback"}
                  onChange={() => setFormRoutingMode("fallback")}
                  className="rounded-full border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Fallback — try in order on error
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="routing_mode"
                  value="pipeline"
                  checked={formRoutingMode === "pipeline"}
                  onChange={() => setFormRoutingMode("pipeline")}
                  className="rounded-full border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Pipeline — chain models step-by-step
                </span>
              </label>
            </div>
          </div>

          <div className="mt-4">
            <ModelsOrderEditor
              label="Models"
              hint="order matters"
              descriptionHint={
                formRoutingMode === "pipeline"
                  ? "Pipeline: each model's output feeds into the next. Add per-step instructions below if you want different roles per model."
                  : "Fallback: try model 1 first, then others only if it errors."
              }
              modelIds={formModelIds}
              options={AVAILABLE_MODELS}
              maxModels={5}
              onChange={setFormModelIds}
            />
          </div>

          <RouterSam3Config value={sam3Config} onChange={setSam3Config} />

          <RouterStepInstructions
            visible={formRoutingMode === "pipeline"}
            modelIds={formModelIds}
            instructionsByModelId={formStepInstructionsByModelId}
            onChangeInstruction={setStepInstruction}
            onUseTemplate={fillPipelineTemplate}
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mt-4">
              <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            href={backHref}
            className="px-4 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : mode === "create" ? "Create" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
