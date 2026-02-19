"use client";

import { useEffect, useRef, useState } from "react";

import { getOverlayBase64 } from "@/lib/base64-image";
import { uploadCatGeneratedImage } from "@/lib/cat-test-image";

export type SavedGeneratedImage = { signedUrl: string; storagePath: string };

export function useAutoSaveGeneratedImages(args: {
  userId: string;
  catSlug: string;
  debugSteps: Array<{ index: number; parsed_json: unknown | null }> | null;
}): {
  runId: string | null;
  savingByStepIndex: Record<number, boolean>;
  savedByStepIndex: Record<number, SavedGeneratedImage>;
  errorsByStepIndex: Record<number, string>;
} {
  const [runId, setRunId] = useState<string | null>(null);
  const [savingByStepIndex, setSavingByStepIndex] = useState<Record<number, boolean>>({});
  const [savedByStepIndex, setSavedByStepIndex] = useState<Record<number, SavedGeneratedImage>>(
    {}
  );
  const [errorsByStepIndex, setErrorsByStepIndex] = useState<Record<number, string>>({});

  const lastRunTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const steps = args.debugSteps ?? null;
    if (!steps || steps.length === 0) {
      setRunId(null);
      setSavingByStepIndex({});
      setSavedByStepIndex({});
      setErrorsByStepIndex({});
      lastRunTokenRef.current = null;
      return;
    }

    // New debugSteps array => treat as a new run.
    const runToken = crypto.randomUUID();
    lastRunTokenRef.current = runToken;
    setRunId(runToken);
    setSavingByStepIndex({});
    setSavedByStepIndex({});
    setErrorsByStepIndex({});

    let cancelled = false;

    (async () => {
      for (const s of steps) {
        if (cancelled) return;
        // If a newer run started, stop processing.
        if (lastRunTokenRef.current !== runToken) return;

        const b64 = getOverlayBase64(s.parsed_json);
        if (!b64) continue;

        setSavingByStepIndex((prev) => ({ ...prev, [s.index]: true }));
        try {
          const saved = await uploadCatGeneratedImage({
            userId: args.userId,
            catSlug: args.catSlug,
            runId: runToken,
            stepIndex: s.index,
            overlayBase64: b64,
          });
          if (cancelled) return;
          setSavedByStepIndex((prev) => ({
            ...prev,
            [s.index]: { signedUrl: saved.signedUrl, storagePath: saved.storagePath },
          }));
        } catch (err) {
          if (cancelled) return;
          const msg = err instanceof Error ? err.message : "Failed to save generated image";
          setErrorsByStepIndex((prev) => ({ ...prev, [s.index]: msg }));
        } finally {
          if (cancelled) return;
          setSavingByStepIndex((prev) => ({ ...prev, [s.index]: false }));
        }
      }
    })().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [args.userId, args.catSlug, args.debugSteps]);

  return { runId, savingByStepIndex, savedByStepIndex, errorsByStepIndex };
}

