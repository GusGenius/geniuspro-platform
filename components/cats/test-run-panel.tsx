"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader2, Save } from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { runCatOnce, type CatRunDebugStep } from "@/components/cats/cat-runner";
import type { CatKitten } from "@/components/cats/types";
import { StepOutputs } from "@/components/cats/step-outputs";

type Props = {
  id?: string;
  catId: string;
  catSlug: string;
  userId: string;
  accessToken: string | null;
  kittens: CatKitten[];
  savedTestImagePath?: string | null;
  onSaveTestImage?: (storagePath: string) => Promise<void>;
  runStep?: number | null;
  onStepRun?: () => void;
  onFullRunResult?: (args: {
    ok: boolean;
    outputText: string;
    debugSteps: CatRunDebugStep[] | null;
  }) => void;
};

function isProbablyUrl(value: string): boolean {
  const v = value.trim();
  return v.startsWith("http://") || v.startsWith("https://") || v.startsWith("data:");
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

import { uploadCatTestImage, getSignedUrl } from "@/lib/cat-test-image";

export function TestRunPanel({
  id,
  catId,
  catSlug,
  userId,
  accessToken,
  kittens,
  savedTestImagePath,
  onSaveTestImage,
  runStep,
  onStepRun,
  onFullRunResult,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const runStepRef = useRef<((step: number | null) => Promise<void>) | null>(null);
  const [testInput, setTestInput] = useState("");
  const [testRunning, setTestRunning] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null);
  const [savedImageLoading, setSavedImageLoading] = useState(false);
  const [savedImageError, setSavedImageError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    | { state: "idle" }
    | { state: "uploading" }
    | { state: "uploaded"; storagePath: string }
    | { state: "saving" }
    | { state: "saved" }
    | { state: "fallback_data_url" }
  >({ state: "idle" });

  const [debugSteps, setDebugSteps] = useState<CatRunDebugStep[] | null>(null);

  const effectiveImageUrl = useMemo(() => {
    const trimmed = imageUrl.trim();
    if (trimmed) return trimmed;
    if (imagePreviewUrl) return imagePreviewUrl;
    return savedImageUrl;
  }, [imageUrl, imagePreviewUrl, savedImageUrl]);

  useEffect(() => {
    if (!savedTestImagePath?.trim() || !userId) {
      console.log("[TestRunPanel] No saved image path or userId, skipping load", {
        savedTestImagePath: savedTestImagePath ?? null,
        hasUserId: !!userId,
      });
      setSavedImageUrl(null);
      setSavedImageLoading(false);
      setSavedImageError(null);
      return;
    }
    setSavedImageLoading(true);
    setSavedImageError(null);
    console.log("[TestRunPanel] Loading saved image", { path: savedTestImagePath });
    getSignedUrl(savedTestImagePath)
      .then((url) => {
        console.log("[TestRunPanel] Saved image loaded", { path: savedTestImagePath, urlLength: url?.length ?? 0 });
        setSavedImageUrl(url);
        setSavedImageError(null);
      })
      .catch((err) => {
        console.warn("[TestRunPanel] Failed to load saved image", { path: savedTestImagePath, err });
        setSavedImageUrl(null);
        setSavedImageError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => setSavedImageLoading(false));
  }, [savedTestImagePath, userId]);

  const onPickFile = async (file: File | null) => {
    setImageFile(file);
    setTestError(null);
    setImageLoadError(null);
    setUploadStatus({ state: "idle" });
    if (!file) {
      setImagePreviewUrl(null);
      return;
    }
    // Local preview (no upload yet).
    const local = await fileToDataUrl(file);
    setImagePreviewUrl(local);
  };

  const kittenLabels = useMemo(() => {
    return kittens.map((k, idx) => ({
      index: idx + 1,
      name: k.name?.trim() || `Step ${idx + 1}`,
      detail:
        (typeof (k as { type?: unknown }).type !== "string" ||
        (k as { type?: unknown }).type === "model"
          ? String((k as { model_id?: unknown }).model_id ?? "").trim()
          : (k as { type?: unknown }).type === "vision_http"
            ? String((k as { path?: unknown }).path ?? "").trim()
            : String((k as { type?: unknown }).type ?? "")).trim(),
    }));
  }, [kittens]);

  const handleTestRun = async () => {
    await handleRunToStep(null);
  };

  const firstKittenTestImage = (kittens[0] as { test_image_storage_path?: string } | undefined)
    ?.test_image_storage_path?.trim();
  const hasImage =
    !!imageUrl.trim() ||
    !!imageFile ||
    !!savedImageUrl ||
    !!firstKittenTestImage;
  const hasText = !!testInput.trim();
  const canRun = hasText || hasImage;

  const handleRunToStep = async (stepIndex: number | null) => {
    if (!accessToken) {
      setTestError("You must be logged in to run a test.");
      return;
    }

    const message = testInput.trim();
    if (!canRun) {
      setTestError(
        hasImage
          ? "Enter a prompt (or leave a short note) to run."
          : "Enter a prompt or add an image to test."
      );
      return;
    }

    const hasUrl = !!imageUrl.trim();
    const hasFile = !!imageFile;
    const hasSaved = !!savedImageUrl;
    const stepIndexForImage = typeof stepIndex === "number" ? stepIndex : null;
    const kittenForStep =
      stepIndexForImage != null && stepIndexForImage >= 1
        ? kittens[stepIndexForImage - 1]
        : null;
    const kittenTestPath = kittenForStep
      ? (kittenForStep as { test_image_storage_path?: string }).test_image_storage_path
      : undefined;

    let finalImageUrl: string | undefined = undefined;
    const shouldSendImage = hasUrl || hasFile || hasSaved || !!kittenTestPath?.trim();

    if (shouldSendImage) {
      if (kittenTestPath?.trim() && stepIndexForImage != null) {
        try {
          finalImageUrl = await getSignedUrl(kittenTestPath);
        } catch {
          /* fall through */
        }
      }
      if (!finalImageUrl && hasUrl) {
        if (!isProbablyUrl(imageUrl)) {
          setTestError("Image URL must start with https:// or data:image/...");
          return;
        }
        finalImageUrl = imageUrl.trim();
      }
      if (!finalImageUrl && hasFile) {
        // “Do it right”: upload to Storage and send signed URL.
        try {
          setUploadStatus({ state: "uploading" });
          const uploaded = await uploadCatTestImage({
            userId,
            catSlug,
            file: imageFile,
          });
          setUploadStatus({ state: "uploaded", storagePath: uploaded.storagePath });
          finalImageUrl = uploaded.signedUrl;
        } catch (_) {
          // Fallback: inline data URL (works even without bucket/policies).
          setUploadStatus({ state: "fallback_data_url" });
          finalImageUrl = await fileToDataUrl(imageFile);
        }
      }
      if (!finalImageUrl && hasSaved) {
        finalImageUrl = savedImageUrl ?? undefined;
      }
    }

    setTestRunning(true);
    setTestError(null);
    setTestOutput(null);
    setDebugSteps(null);
    try {
      const res = await runCatOnce({
        accessToken,
        catSlug,
        userMessage: message || (shouldSendImage ? "Analyze this image." : ""),
        imageUrl: finalImageUrl,
        debugPipeline: true,
        debugRunStep: typeof stepIndex === "number" ? stepIndex : undefined,
      });
      setTestOutput(res.text);
      setDebugSteps(res.debugSteps ?? null);

      // Only notify for a full run; step runs are for debugging.
      if (stepIndex === null) {
        onFullRunResult?.({
          ok: true,
          outputText: res.text,
          debugSteps: res.debugSteps ?? null,
        });
      }
    } catch (err) {
      setTestError(err instanceof Error ? err.message : "Test run failed");
      if (stepIndex === null) {
        onFullRunResult?.({
          ok: false,
          outputText: "",
          debugSteps: null,
        });
      }
    } finally {
      setTestRunning(false);
    }
  };

  runStepRef.current = handleRunToStep;

  useEffect(() => {
    if (typeof runStep !== "number" || runStep <= 0) return;
    containerRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowSteps(true);
    const fn = runStepRef.current;
    if (fn && accessToken && canRun) {
      void fn(runStep).finally(() => onStepRun?.());
    } else {
      if (!canRun) setTestError("Add an image or enter a prompt to test.");
      onStepRun?.();
    }
  }, [runStep, canRun]);

  return (
    <div
      ref={containerRef}
      id={id}
      className="mt-6 bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Test run
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Runs{" "}
            <code className="bg-gray-200 dark:bg-gray-900 px-1 rounded">
              model=cat:{catSlug}
            </code>{" "}
            using your current session.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowSteps((s) => !s)}
          className="text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
        >
          {showSteps ? "Hide step outputs" : "Show step outputs"}
        </button>
      </div>

      <div className="mt-4">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
          Image
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Some cats (vision flows) require an image. Upload one or paste a URL.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white/60 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
              Upload
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              We upload to Storage (private) and send a signed URL.
            </p>
            <input
              type="file"
              accept="image/*"
              className="mt-3 block w-full text-xs text-gray-600 dark:text-gray-300 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border file:border-gray-200 dark:file:border-gray-700 file:bg-gray-100 dark:file:bg-gray-900 file:text-gray-700 dark:file:text-gray-200"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                void onPickFile(file);
              }}
            />
            {uploadStatus.state !== "idle" ? (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {uploadStatus.state === "uploading" ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Uploading...
                  </span>
                ) : uploadStatus.state === "saving" ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </span>
                ) : uploadStatus.state === "saved" ? (
                  <span className="inline-flex items-center gap-2">
                    <Check className="w-3 h-3 text-green-500" />
                    Saved as default
                  </span>
                ) : uploadStatus.state === "uploaded" ? (
                  <span className="inline-flex items-center gap-2">
                    <Check className="w-3 h-3 text-green-500" />
                    Uploaded
                  </span>
                ) : (
                  "Using inline image data (fallback)."
                )}
              </div>
            ) : null}
          </div>

          <div className="bg-white/60 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
              URL
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Paste an https:// URL (or a data:image/... URL).
            </p>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/house.jpg"
              className="mt-3 w-full px-3 py-2.5 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
            />
          </div>
        </div>

        {(savedTestImagePath || savedImageLoading) && !effectiveImageUrl ? (
          <div className="mt-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-900/50">
            {savedImageLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading saved image...
              </div>
            ) : savedImageError ? (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Saved image could not be loaded: {savedImageError}
              </p>
            ) : null}
          </div>
        ) : null}

        {effectiveImageUrl ? (
          <div className="mt-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {savedImageUrl && effectiveImageUrl === savedImageUrl
                  ? "Saved default image"
                  : "Preview"}
              </p>
              {onSaveTestImage && (imageFile || (imageUrl.trim().startsWith("data:") && imageUrl.trim().length > 100)) ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (!imageFile && !imageUrl.trim().startsWith("data:")) return;
                    setUploadStatus({ state: "saving" });
                    console.log("[TestRunPanel] Saving test image as default...");
                    try {
                      let file: File;
                      if (imageFile) {
                        file = imageFile;
                      } else {
                        const res = await fetch(imageUrl.trim());
                        const blob = await res.blob();
                        file = new File([blob], "test-image.jpg", { type: blob.type || "image/jpeg" });
                      }
                      const { storagePath } = await uploadCatTestImage({
                        userId,
                        catSlug,
                        file,
                      });
                      console.log("[TestRunPanel] Uploaded, storagePath:", storagePath);
                      await onSaveTestImage(storagePath);
                      setSavedImageUrl(await getSignedUrl(storagePath));
                      setUploadStatus({ state: "saved" });
                      console.log("[TestRunPanel] Saved as default successfully");
                    } catch (err) {
                      console.warn("[TestRunPanel] Save failed", err);
                      setTestError(err instanceof Error ? err.message : "Failed to save");
                      setUploadStatus({ state: "idle" });
                    }
                  }}
                  disabled={uploadStatus.state === "saving"}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 font-medium disabled:opacity-50"
                >
                  {uploadStatus.state === "saving" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Save className="w-3 h-3" />
                  )}
                  Save as default
                </button>
              ) : null}
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-200/60 dark:bg-gray-900/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={effectiveImageUrl}
                alt="Test image"
                className="w-full max-h-64 object-contain"
                onError={() => setImageLoadError("Image failed to load")}
                onLoad={() => setImageLoadError(null)}
              />
            </div>
            {imageLoadError ? (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                {imageLoadError}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
          Input
        </label>
        <textarea
          value={testInput}
          onChange={(e) => setTestInput(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Prompt (optional for vision cats—add an image above to run)"
        />
        <div className="mt-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Test each kitten individually (runs through that step) or run the full pipeline.
          </p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {kittenLabels.map((k) => (
              <button
                key={k.index}
                type="button"
                onClick={() => void handleRunToStep(k.index)}
                disabled={testRunning || !canRun}
                className="px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={`Run through step ${k.index}: ${k.name}`}
              >
                Step {k.index}: {k.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void handleRunToStep(null)}
              disabled={testRunning || !canRun}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running...
                </>
              ) : (
                "Run full"
              )}
            </button>
          </div>
        </div>
      </div>

      {testError ? (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-600 dark:text-red-300 text-sm">{testError}</p>
        </div>
      ) : null}

      <StepOutputs show={showSteps} debugSteps={debugSteps} stepLabels={kittenLabels} />

      {testOutput ? (
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
            Final output
          </label>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 bg-gray-200/70 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            {testOutput}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

