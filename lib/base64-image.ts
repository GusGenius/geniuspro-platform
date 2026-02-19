export type Base64ImageMime = "image/png" | "image/jpeg";

export function guessMimeTypeFromBase64(base64: string): Base64ImageMime {
  const t = base64.trim();
  // PNG base64 signature: iVBORw0K...
  if (t.startsWith("iVBORw0K")) return "image/png";
  // JPEG base64 signature: /9j/...
  if (t.startsWith("/9j/")) return "image/jpeg";
  // Default to PNG since our overlay flows are typically PNG.
  return "image/png";
}

export function toDataUrl(mimeType: string, base64: string): string {
  return `data:${mimeType};base64,${base64.trim()}`;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/**
 * Common field used by our image-gen and vision overlay steps.
 * Also checks a couple debug alternates.
 */
export function getOverlayBase64(parsed: unknown): string | null {
  if (!isRecord(parsed)) return null;
  const b64 = parsed.overlay_base64;
  if (typeof b64 === "string" && b64.trim()) return b64.trim();

  const alt = parsed.overlay_image_base64 ?? parsed.gemini_overlay_base64;
  if (typeof alt === "string" && alt.trim()) return alt.trim();
  return null;
}

