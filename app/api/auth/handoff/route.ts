import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler-client";

type HandoffBody = {
  access_token?: unknown;
  refresh_token?: unknown;
};

export async function POST(request: Request) {
  let body: HandoffBody;
  try {
    body = (await request.json()) as HandoffBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const accessToken = typeof body.access_token === "string" ? body.access_token : "";
  const refreshToken = typeof body.refresh_token === "string" ? body.refresh_token : "";
  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "Missing authentication tokens" }, { status: 400 });
  }

  const supabase = await createSupabaseRouteHandlerClient();
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to set session" },
      { status: 401 }
    );
  }

  return NextResponse.json(
    {
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
      user: data.user ?? null,
    },
    { status: 200 }
  );
}

