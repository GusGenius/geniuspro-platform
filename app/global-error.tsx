"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            fontFamily: "system-ui, sans-serif",
            backgroundColor: "#f9fafb",
          }}
        >
          <div
            style={{
              maxWidth: "400px",
              padding: "32px",
              backgroundColor: "white",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              textAlign: "center",
            }}
          >
            <h1 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px" }}>
              {error.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={reset}
              style={{
                padding: "10px 16px",
                backgroundColor: "#00b8a9",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
