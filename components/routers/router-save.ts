import type { User } from "@supabase/supabase-js";

import { isMissingColumnError } from "@/components/routers/router-form-utils";

export type SaveRouterArgs = {
  supabase: {
    from: (table: string) => any;
  };
  user: User;
  editingId?: string;
  payloadBase: {
    user_id: string;
    slug: string;
    name: string;
    instructions: string;
    model_id: string;
    fallback_model_id: string | null;
    updated_at: string;
  };
  modelIds: string[];
  routingMode: "fallback" | "pipeline";
  routerSteps: unknown | null;
};

export async function saveRouterToSupabase(args: SaveRouterArgs): Promise<{
  ok: true;
} | { ok: false; error: unknown }> {
  const routingModePayload = args.routingMode === "pipeline" ? "pipeline" : "fallback";

  try {
    if (args.editingId) {
      const updatePayload: Record<string, unknown> = {
        name: args.payloadBase.name,
        instructions: args.payloadBase.instructions,
        model_id: args.payloadBase.model_id,
        fallback_model_id: args.payloadBase.fallback_model_id,
        model_ids: args.modelIds,
        routing_mode: routingModePayload,
        // Always write router_steps on edit so disabling SAM3 clears it.
        router_steps: args.routerSteps,
        updated_at: args.payloadBase.updated_at,
      };

      const res = await args.supabase
        .from("user_routers")
        .update(updatePayload)
        .eq("id", args.editingId)
        .eq("user_id", args.user.id);

      if (!res.error) return { ok: true };

      // Backwards compatible retry paths (columns may not exist yet).
      if (isMissingColumnError(res.error, "routing_mode")) {
        delete updatePayload.routing_mode;
        const retry = await args.supabase
          .from("user_routers")
          .update(updatePayload)
          .eq("id", args.editingId)
          .eq("user_id", args.user.id);
        if (retry.error) {
          if (isMissingColumnError(retry.error, "router_steps")) {
            if (args.routerSteps !== null) {
              return {
                ok: false,
                error: new Error(
                  "Database is missing `user_routers.router_steps`. Apply the Supabase migration before using SAM 3 routers."
                ),
              };
            }
            delete updatePayload.router_steps;
            const retry2 = await args.supabase
              .from("user_routers")
              .update(updatePayload)
              .eq("id", args.editingId)
              .eq("user_id", args.user.id);
            if (retry2.error) return { ok: false, error: retry2.error };
            return { ok: true };
          }
          return { ok: false, error: retry.error };
        }
        return { ok: true };
      }

      if (isMissingColumnError(res.error, "router_steps")) {
        if (args.routerSteps !== null) {
          return {
            ok: false,
            error: new Error(
              "Database is missing `user_routers.router_steps`. Apply the Supabase migration before using SAM 3 routers."
            ),
          };
        }
        delete updatePayload.router_steps;
        const retry = await args.supabase
          .from("user_routers")
          .update(updatePayload)
          .eq("id", args.editingId)
          .eq("user_id", args.user.id);
        if (retry.error) {
          if (isMissingColumnError(retry.error, "routing_mode")) {
            delete updatePayload.routing_mode;
            const retry2 = await args.supabase
              .from("user_routers")
              .update(updatePayload)
              .eq("id", args.editingId)
              .eq("user_id", args.user.id);
            if (retry2.error) return { ok: false, error: retry2.error };
            return { ok: true };
          }
          return { ok: false, error: retry.error };
        }
        return { ok: true };
      }

      if (isMissingColumnError(res.error, "model_ids")) {
        const legacy = await args.supabase
          .from("user_routers")
          .update({
            name: args.payloadBase.name,
            instructions: args.payloadBase.instructions,
            model_id: args.payloadBase.model_id,
            fallback_model_id: args.payloadBase.fallback_model_id,
            updated_at: args.payloadBase.updated_at,
          })
          .eq("id", args.editingId)
          .eq("user_id", args.user.id);
        if (legacy.error) return { ok: false, error: legacy.error };
        return { ok: true };
      }

      return { ok: false, error: res.error };
    }

    const insertPayload = {
      ...args.payloadBase,
      model_ids: args.modelIds,
      routing_mode: routingModePayload,
      ...(args.routerSteps ? { router_steps: args.routerSteps } : {}),
    };
    const insertRes = await args.supabase.from("user_routers").insert(insertPayload);
    if (!insertRes.error) return { ok: true };

    if (isMissingColumnError(insertRes.error, "routing_mode")) {
      const { routing_mode: _rm, ...insertWithoutRouting } = insertPayload;
      const retry = await args.supabase.from("user_routers").insert(insertWithoutRouting);
      if (retry.error) {
        if (isMissingColumnError(retry.error, "router_steps")) {
          if (args.routerSteps !== null) {
            return {
              ok: false,
              error: new Error(
                "Database is missing `user_routers.router_steps`. Apply the Supabase migration before using SAM 3 routers."
              ),
            };
          }
          const { router_steps: _rs, ...insertWithoutSteps } = insertWithoutRouting;
          const retry2 = await args.supabase
            .from("user_routers")
            .insert(insertWithoutSteps);
          if (retry2.error) return { ok: false, error: retry2.error };
          return { ok: true };
        }
        return { ok: false, error: retry.error };
      }
      return { ok: true };
    }

    if (isMissingColumnError(insertRes.error, "router_steps")) {
      if (args.routerSteps !== null) {
        return {
          ok: false,
          error: new Error(
            "Database is missing `user_routers.router_steps`. Apply the Supabase migration before using SAM 3 routers."
          ),
        };
      }
      const { router_steps: _rs, ...insertWithoutSteps } = insertPayload;
      const retry = await args.supabase.from("user_routers").insert(insertWithoutSteps);
      if (retry.error) {
        if (isMissingColumnError(retry.error, "routing_mode")) {
          const { routing_mode: _rm, ...insertWithoutRouting } = insertWithoutSteps;
          const retry2 = await args.supabase
            .from("user_routers")
            .insert(insertWithoutRouting);
          if (retry2.error) return { ok: false, error: retry2.error };
          return { ok: true };
        }
        return { ok: false, error: retry.error };
      }
      return { ok: true };
    }

    if (isMissingColumnError(insertRes.error, "model_ids")) {
      const legacy = await args.supabase.from("user_routers").insert(args.payloadBase);
      if (legacy.error) return { ok: false, error: legacy.error };
      return { ok: true };
    }

    return { ok: false, error: insertRes.error };
  } catch (error) {
    return { ok: false, error };
  }
}

