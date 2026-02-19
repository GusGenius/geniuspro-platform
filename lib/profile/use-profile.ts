"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export interface ProfileInfo {
  isAdmin: boolean;
}

export function useProfile(userId: string | undefined): ProfileInfo & { loading: boolean } {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("is_admin")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        setIsAdmin(false);
      } else {
        setIsAdmin(Boolean((data as { is_admin?: boolean } | null)?.is_admin));
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { isAdmin, loading };
}
