"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";
import { RouterForm } from "@/components/routers/router-form";
import type { RouterFormData } from "@/components/routers/router-form";

function normalizeModelIds(input: Array<string | null | undefined>): string[] {
  const out: string[] = [];
  for (const v of input) {
    if (typeof v !== "string") continue;
    const trimmed = v.trim();
    if (!trimmed) continue;
    if (!out.includes(trimmed)) out.push(trimmed);
  }
  return out;
}

export default function EditRouterPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [initialData, setInitialData] = useState<RouterFormData | null>(null);

  useEffect(() => {
    if (!user || !id) {
      setLoading(false);
      setNotFound(!id);
      return;
    }
    const userId = user.id;
    async function fetchRouter() {
      type RouterData = {
        name?: string;
        slug?: string;
        instructions?: string;
        model_id?: string;
        fallback_model_id?: string | null;
        model_ids?: string[] | null;
        routing_mode?: string;
        router_steps?: unknown | null;
      };
      let data: RouterData | null = null;
      let err: { message?: string } | null = null;

      const withRouting = await supabase
        .from("user_routers")
        .select("id, slug, name, instructions, model_id, fallback_model_id, model_ids, routing_mode, router_steps")
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      const msg = withRouting.error?.message?.toLowerCase() ?? "";
      const isRoutingColumnMissing =
        msg.includes("routing_mode") && msg.includes("does not exist");
      const isRouterStepsMissing =
        msg.includes("router_steps") && msg.includes("does not exist");

      if (withRouting.error && (isRoutingColumnMissing || isRouterStepsMissing)) {
        const select = isRoutingColumnMissing
          ? "id, slug, name, instructions, model_id, fallback_model_id, model_ids, router_steps"
          : isRouterStepsMissing
            ? "id, slug, name, instructions, model_id, fallback_model_id, model_ids, routing_mode"
            : "id, slug, name, instructions, model_id, fallback_model_id, model_ids";
        const withoutRouting = await supabase
          .from("user_routers")
          .select(select)
          .eq("id", id)
          .eq("user_id", userId)
          .single();
        data = withoutRouting.data as RouterData | null;
        err = withoutRouting.error;
      } else {
        data = withRouting.data as RouterData | null;
        err = withRouting.error;
      }

      if (err || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const ids =
        Array.isArray(data.model_ids) && data.model_ids.length > 0
          ? data.model_ids
          : normalizeModelIds([data.model_id, data.fallback_model_id ?? null]);

      const mode =
        data.routing_mode?.trim().toLowerCase() === "pipeline"
          ? ("pipeline" as const)
          : ("fallback" as const);

      setInitialData({
        name: data.name ?? "",
        slug: data.slug ?? "",
        instructions: data.instructions ?? "",
        model_ids: ids.length > 0 ? ids : ["gemini-3-flash"],
        routing_mode: mode,
        router_steps: data.router_steps ?? null,
      });
      setLoading(false);
    }
    fetchRouter();
  }, [user?.id, id]);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (notFound || !initialData || !id) {
    return (
      <div className="min-h-full p-6 md:p-10 flex flex-col items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Router not found or you don&apos;t have access.
        </p>
        <a
          href="/routers"
          className="text-blue-500 hover:text-blue-400 text-sm"
        >
          Back to Routers
        </a>
      </div>
    );
  }

  return (
    <RouterForm
      mode="edit"
      editingId={id}
      initialData={initialData}
      backHref="/routers"
      backLabel="Back to Routers"
    />
  );
}
