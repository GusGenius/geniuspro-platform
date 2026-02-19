import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies chat completions to api.geniuspro.io.
 * Same-origin flow avoids CORS; forwards user JWT for auth.
 */
const API_BASE =
  process.env.GENIUSPRO_API_URL?.replace(/\/v1\/?$/, "") ||
  "https://api.geniuspro.io";
const CHAT_URL = `${API_BASE}/chat/completions`;

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

  const res = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const contentType = res.headers.get("content-type") ?? "";

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
