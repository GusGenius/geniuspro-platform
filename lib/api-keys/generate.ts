/**
 * Generate and hash API keys.
 * Format: gp-<48 hex chars>  (24 random bytes)
 * Server validates by SHA-256 hashing the provided key
 * and matching against the stored key_hash column.
 */

export function generateApiKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `gp-${hex}`;
}

export async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Display prefix like "gp-ab12...ef56" */
export function getKeyPrefix(key: string): string {
  return key.slice(0, 7) + "..." + key.slice(-4);
}
