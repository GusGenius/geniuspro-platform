"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Download, ExternalLink } from "lucide-react";

import { getOverlayBase64, guessMimeTypeFromBase64, toDataUrl } from "@/lib/base64-image";

export type StepLabel = { index: number; name: string; detail: string };

export type CatRunDebugStep = {
  index: number;
  client_model: string;
  provider_model: string;
  duration_ms: number;
  output_text: string;
  parsed_json: unknown | null;
};

export function StepOutputs(props: {
  show: boolean;
  debugSteps: CatRunDebugStep[] | null;
  stepLabels: StepLabel[];
  savedGeneratedByStepIndex?: Record<number, { signedUrl: string; storagePath: string }>;
  savingGeneratedByStepIndex?: Record<number, boolean>;
  saveErrorsByStepIndex?: Record<number, string>;
}) {
  const {
    show,
    debugSteps,
    stepLabels,
    savedGeneratedByStepIndex,
    savingGeneratedByStepIndex,
    saveErrorsByStepIndex,
  } = props;
  const [openStepIndices, setOpenStepIndices] = useState<Set<number>>(() => new Set());

  // When the steps change (new run), open them all by default.
  useEffect(() => {
    if (!debugSteps || debugSteps.length === 0) return;
    setOpenStepIndices(new Set(debugSteps.map((s) => s.index)));
  }, [debugSteps]);

  const steps = debugSteps ?? [];
  const canRender = show && steps.length > 0;

  const toggleStepOpen = (index: number) => {
    setOpenStepIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (!canRender) return null;

  return (
    <div className="mt-4 min-w-0 overflow-hidden">
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
        Step outputs
      </label>
      <div className="space-y-2">
        {steps.map((s) => {
          const label = stepLabels[s.index - 1];
          const isOpen = openStepIndices.has(s.index);
          const title = label ? `${s.index}. ${label.name}` : `${s.index}. Step`;

          const overlayBase64 = getOverlayBase64(s.parsed_json);
          const overlayMimeType = overlayBase64 ? guessMimeTypeFromBase64(overlayBase64) : null;
          const overlayDataUrl =
            overlayBase64 && overlayMimeType ? toDataUrl(overlayMimeType, overlayBase64) : null;

          const filenameBase = `step-${s.index}-overlay${overlayMimeType === "image/jpeg" ? ".jpg" : ".png"}`;
          const saved = savedGeneratedByStepIndex?.[s.index] ?? null;
          const saving = savingGeneratedByStepIndex?.[s.index] ?? false;
          const saveError = saveErrorsByStepIndex?.[s.index] ?? null;

          return (
            <div
              key={s.index}
              className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleStepOpen(s.index)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gray-200/60 dark:bg-gray-900/60 hover:bg-gray-200 dark:hover:bg-gray-900 transition-colors"
              >
                <div className="min-w-0 text-left">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                    {title}
                  </p>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                    {s.client_model}
                    {s.duration_ms ? ` · ${s.duration_ms}ms` : ""}
                  </p>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {isOpen ? (
                <div className="px-4 py-3 bg-white/60 dark:bg-gray-950/40">
                  {overlayDataUrl ? (
                    <div className="mb-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
                          Generated image preview
                        </p>
                        <div className="flex items-center gap-2">
                          {saving ? (
                            <span className="text-[11px] text-gray-500 dark:text-gray-400">
                              Saving...
                            </span>
                          ) : saved ? (
                            <span
                              className="text-[11px] text-green-700 dark:text-green-400 truncate max-w-[220px]"
                              title={saved.storagePath}
                            >
                              Saved
                            </span>
                          ) : saveError ? (
                            <span
                              className="text-[11px] text-amber-700 dark:text-amber-400 truncate max-w-[260px]"
                              title={saveError}
                            >
                              Save failed
                            </span>
                          ) : null}
                          <a
                            href={saved?.signedUrl ?? overlayDataUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 text-[11px] text-gray-700 dark:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-900/60"
                            title="Open generated image"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Open
                          </a>
                          <a
                            href={saved?.signedUrl ?? overlayDataUrl}
                            download={filenameBase}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 text-[11px] text-gray-700 dark:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-900/60"
                            title="Download generated image"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </a>
                        </div>
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={overlayDataUrl}
                        alt={`Step ${s.index} generated overlay`}
                        className="w-full max-h-80 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100/60 dark:bg-gray-900/60"
                      />
                      <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                        If this is huge, use Download to save the image file.
                      </p>
                    </div>
                  ) : null}

                  <pre className="whitespace-pre-wrap text-xs text-gray-800 dark:text-gray-200 overflow-x-auto max-w-full">
                    {s.output_text}
                  </pre>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

