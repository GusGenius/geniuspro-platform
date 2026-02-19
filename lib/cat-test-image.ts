import { supabase } from "@/lib/supabase/client";
import { guessMimeTypeFromBase64, toDataUrl, type Base64ImageMime } from "@/lib/base64-image";

export async function uploadCatTestImage(args: {
  userId: string;
  catSlug: string;
  file: File;
  kittenId?: string;
}): Promise<{ signedUrl: string; storagePath: string }> {
  const ext = (() => {
    const name = args.file.name || "image";
    const parts = name.split(".");
    return parts.length > 1 ? parts[parts.length - 1] : "jpg";
  })();
  const objectName = args.kittenId
    ? `kitten-${args.kittenId}.${ext}`
    : `test-image.${ext}`;
  const storagePath = `${args.userId}/${args.catSlug}/${objectName}`;

  const up = await supabase.storage
    .from("cat-test-runs")
    .upload(storagePath, args.file, {
      upsert: true,
      contentType: args.file.type || "image/jpeg",
    });
  if (up.error) throw up.error;

  const signed = await supabase.storage
    .from("cat-test-runs")
    .createSignedUrl(storagePath, 60 * 15);
  if (signed.error || !signed.data?.signedUrl) {
    throw signed.error ?? new Error("Failed to create signed URL");
  }
  return { signedUrl: signed.data.signedUrl, storagePath };
}

export async function getSignedUrl(storagePath: string): Promise<string> {
  const signed = await supabase.storage
    .from("cat-test-runs")
    .createSignedUrl(storagePath, 60 * 15);
  if (signed.error || !signed.data?.signedUrl) {
    throw signed.error ?? new Error("Failed to create signed URL");
  }
  return signed.data.signedUrl;
}

export async function uploadCatGeneratedImage(args: {
  userId: string;
  catSlug: string;
  runId: string;
  stepIndex: number;
  overlayBase64: string;
}): Promise<{ signedUrl: string; storagePath: string; mimeType: Base64ImageMime }> {
  const mimeType = guessMimeTypeFromBase64(args.overlayBase64);
  const ext = mimeType === "image/jpeg" ? "jpg" : "png";

  // Convert base64 → Blob via data URL fetch (works in browser, avoids manual atob).
  const dataUrl = toDataUrl(mimeType, args.overlayBase64);
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], `step-${args.stepIndex}-overlay.${ext}`, {
    type: mimeType,
  });

  const storagePath = [
    args.userId,
    args.catSlug,
    "generated",
    args.runId,
    `step-${args.stepIndex}-overlay.${ext}`,
  ].join("/");

  const up = await supabase.storage
    .from("cat-test-runs")
    .upload(storagePath, file, {
      upsert: true,
      contentType: mimeType,
    });
  if (up.error) throw up.error;

  const signed = await supabase.storage
    .from("cat-test-runs")
    .createSignedUrl(storagePath, 60 * 15);
  if (signed.error || !signed.data?.signedUrl) {
    throw signed.error ?? new Error("Failed to create signed URL");
  }

  return { signedUrl: signed.data.signedUrl, storagePath, mimeType };
}
