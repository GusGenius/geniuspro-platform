import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies chat completions to api.geniuspro.io.
 * Same-origin flow avoids CORS; forwards user JWT for auth.
 */
const API_BASE =
  process.env.GENIUSPRO_API_URL?.replace(/\/v1\/?$/, "") ||
  "https://api.geniuspro.io";
const CHAT_URL = `${API_BASE}/chat/completions`;

function isStreamingRequestBody(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const v = (body as Record<string, unknown>).stream;
  return v === true;
}

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: { message: "Missing or invalid Authorization header" } },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const streamRequested = isStreamingRequestBody(body);

  let res: Response;
  try {
    res = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        Authorization: auth,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream request failed";
    return NextResponse.json(
      {
        error: {
          message: "Failed to reach upstream API",
          upstream: CHAT_URL,
          detail: message,
        },
      },
      { status: 502 }
    );
  }

  const contentType = res.headers.get("content-type") ?? "";

  // If upstream is streaming, don't buffer the whole body (avoids timeouts).
  if (
    res.ok &&
    (contentType.includes("text/event-stream") || (streamRequested && res.body))
  ) {
    return new NextResponse(res.body, {
      status: res.status,
      headers: {
        "Content-Type": contentType || "text/event-stream",
        // Avoid proxy buffering; keep SSE snappy.
        "Cache-Control": "no-cache, no-transform",
      },
    });
  }

  const text = await res.text();

  if (!res.ok) {
    let parsed: unknown;
    try {
      parsed = text ? JSON.parse(text) : { error: { message: "Request failed" } };
    } catch {
      parsed = { error: { message: text || "Request failed" } };
    }
    return NextResponse.json(parsed, { status: res.status });
  }

  if (contentType.includes("application/json")) {
    try {
      return NextResponse.json(JSON.parse(text), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new NextResponse(text, {
        status: res.status,
        headers: { "Content-Type": contentType },
      });
    }
  }

  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": contentType },
  });
}
