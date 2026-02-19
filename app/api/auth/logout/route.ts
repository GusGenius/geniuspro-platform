import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler-client";

export async function POST() {
  const supabase = await createSupabaseRouteHandlerClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true }, { status: 200 });
}

