import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler-client";

export async function GET() {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({ user: data.user }, { status: 200 });
}

