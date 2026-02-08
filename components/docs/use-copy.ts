import { useCallback, useState } from "react";

export function useCopy() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyCode = useCallback((code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  }, []);

  const copyText = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  }, []);

  return { copiedCode, copiedText, copyCode, copyText };
}

