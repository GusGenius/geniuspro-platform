"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { runCatOnce, type CatRunDebugStep } from "@/components/cats/cat-runner";
import type { CatKitten } from "@/components/cats/types";

type Props = {
  catSlug: string;
  accessToken: string | null;
  kittens: CatKitten[];
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

async function uploadToStorage(args: {
  userId: string;
  catSlug: string;
  file: File;
}): Promise<{ signedUrl: string; storagePath: string }> {
  const ext = (() => {
    const name = args.file.name || "image";
    const parts = name.split(".");
    return parts.length > 1 ? parts[parts.length - 1] : "jpg";
  })();
  const objectName = `${crypto.randomUUID()}.${ext}`;
  const storagePath = `${args.userId}/${args.catSlug}/${objectName}`;

  const up = await supabase.storage
    .from("cat-test-runs")
    .upload(storagePath, args.file, {
      upsert: true,
      contentType: args.file.type || "image/jpeg",
    });
  if (up.error) {
    throw up.error;
  }

  const signed = await supabase.storage
    .from("cat-test-runs")
    .createSignedUrl(storagePath, 60 * 15);
  if (signed.error || !signed.data?.signedUrl) {
    throw signed.error ?? new Error("Failed to create signed URL");
  }

  return { signedUrl: signed.data.signedUrl, storagePath };
}

export function TestRunPanel({ catSlug, accessToken, kittens }: Props) {
  const [testInput, setTestInput] = useState("");
  const [testRunning, setTestRunning] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    | { state: "idle" }
    | { state: "uploading" }
    | { state: "uploaded"; storagePath: string }
    | { state: "fallback_data_url" }
  >({ state: "idle" });

  const [debugSteps, setDebugSteps] = useState<CatRunDebugStep[] | null>(null);
  const [openStepIndices, setOpenStepIndices] = useState<Set<number>>(
    () => new Set()
  );

  const effectiveImageUrl = useMemo(() => {
    const trimmed = imageUrl.trim();
    if (trimmed) return trimmed;
    return imagePreviewUrl;
  }, [imageUrl, imagePreviewUrl]);

  const onPickFile = async (file: File | null) => {
    setImageFile(file);
    setTestError(null);
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
      model: k.model_id?.trim() || "",
    }));
  }, [kittens]);

  const handleTestRun = async () => {
    if (!accessToken) {
      setTestError("You must be logged in to run a test.");
      return;
    }

    const message = testInput.trim();
    if (!message) {
      setTestError("Enter something to test.");
      return;
    }

    // Prefer URL input; else use uploaded file.
    const hasUrl = !!imageUrl.trim();
    const hasFile = !!imageFile;
    const shouldSendImage = hasUrl || hasFile;

    let finalImageUrl: string | undefined = undefined;

    if (shouldSendImage) {
      if (hasUrl) {
        if (!isProbablyUrl(imageUrl)) {
          setTestError("Image URL must start with https:// or data:image/...");
          return;
        }
        finalImageUrl = imageUrl.trim();
      } else if (imageFile) {
        // “Do it right”: upload to Storage and send signed URL.
        try {
          setUploadStatus({ state: "uploading" });
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser();
          if (error || !user?.id) throw error ?? new Error("Not logged in");

          const uploaded = await uploadToStorage({
            userId: user.id,
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
    }

    setTestRunning(true);
    setTestError(null);
    setTestOutput(null);
    setDebugSteps(null);
    try {
      const res = await runCatOnce({
        accessToken,
        catSlug,
        userMessage: message,
        imageUrl: finalImageUrl,
        debugPipeline: true,
      });
      setTestOutput(res.text);
      setDebugSteps(res.debugSteps ?? null);
      // Open all steps by default when step viewer is enabled.
      setOpenStepIndices(new Set((res.debugSteps ?? []).map((s) => s.index)));
    } catch (err) {
      setTestError(err instanceof Error ? err.message : "Test run failed");
    } finally {
      setTestRunning(false);
    }
  };

  const toggleStepOpen = (index: number) => {
    setOpenStepIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="mt-6 bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5 sm:p-6">
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
          Image (optional)
        </label>
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

        {effectiveImageUrl ? (
          <div className="mt-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Preview
            </p>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-200/60 dark:bg-gray-900/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={effectiveImageUrl}
                alt=""
                className="w-full max-h-64 object-contain"
              />
            </div>
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
          placeholder="Paste a prompt to test this cat..."
        />
        <div className="mt-3 flex items-center justify-end">
          <button
            type="button"
            onClick={() => void handleTestRun()}
            disabled={testRunning || !testInput.trim()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              "Run"
            )}
          </button>
        </div>
      </div>

      {testError ? (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-600 dark:text-red-300 text-sm">{testError}</p>
        </div>
      ) : null}

      {showSteps && debugSteps && debugSteps.length > 0 ? (
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
            Step outputs
          </label>
          <div className="space-y-2">
            {debugSteps.map((s) => {
              const kitten = kittenLabels[s.index - 1];
              const isOpen = openStepIndices.has(s.index);
              const title = kitten
                ? `${s.index}. ${kitten.name}`
                : `${s.index}. Step`;
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
      ) : null}

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

