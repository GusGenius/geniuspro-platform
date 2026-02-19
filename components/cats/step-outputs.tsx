"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Download, ExternalLink } from "lucide-react";

export type StepLabel = { index: number; name: string; detail: string };

export type CatRunDebugStep = {
  index: number;
  client_model: string;
  provider_model: string;
  duration_ms: number;
  output_text: string;
  parsed_json: unknown | null;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function guessMimeTypeFromBase64(b64: string): "image/png" | "image/jpeg" {
  const t = b64.trim();
  // PNG base64 signature: iVBORw0K...
  if (t.startsWith("iVBORw0K")) return "image/png";
  // JPEG base64 signature: /9j/...
  if (t.startsWith("/9j/")) return "image/jpeg";
  // Default to PNG since our overlay flows are typically PNG.
  return "image/png";
}

function getOverlayBase64(parsed: unknown): string | null {
  if (!isRecord(parsed)) return null;
  const b64 = parsed.overlay_base64;
  if (typeof b64 === "string" && b64.trim()) return b64.trim();

  // Sometimes we preserve alternates for debugging.
  const alt = parsed.overlay_image_base64 ?? parsed.gemini_overlay_base64;
  if (typeof alt === "string" && alt.trim()) return alt.trim();
  return null;
}

function toDataUrl(mimeType: string, base64: string): string {
  return `data:${mimeType};base64,${base64}`;
}

export function StepOutputs(props: {
  show: boolean;
  debugSteps: CatRunDebugStep[] | null;
  stepLabels: StepLabel[];
}) {
  const { show, debugSteps, stepLabels } = props;
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
    <div className="mt-4">
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
                          <a
                            href={overlayDataUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 text-[11px] text-gray-700 dark:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-900/60"
                            title="Open generated image"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Open
                          </a>
                          <a
                            href={overlayDataUrl}
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

                  <pre className="whitespace-pre-wrap text-xs text-gray-800 dark:text-gray-200">
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

