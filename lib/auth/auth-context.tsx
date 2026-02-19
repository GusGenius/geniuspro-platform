"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let isInitialized = false;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!mounted) return;
        
        if (error) {
          console.error("Error getting session:", error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        isInitialized = true;
      } catch (error) {
        if (!mounted) return;
        console.error("Error initializing auth:", error);
        setLoading(false);
        isInitialized = true;
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted || !isInitialized) return;
      
      if (event === 'INITIAL_SESSION') {
        return;
      }
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = (await res.json().catch(() => ({}))) as any;
      if (!res.ok) {
        const rawMessage = typeof json?.error === "string" ? json.error : "Login failed";
        const errorMessage = rawMessage.includes("Invalid login credentials")
          ? "Invalid email or password."
          : rawMessage;
        return { error: { message: errorMessage } };
      }

      const accessToken = json?.session?.access_token;
      const refreshToken = json?.session?.refresh_token;
      if (typeof accessToken === "string" && typeof refreshToken === "string") {
        // Keep the browser Supabase client in sync (localStorage, onAuthStateChange, etc.).
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      return { error: { message: errorMessage } };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Best-effort; still clear local session below.
    }
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({ user, session, loading, signIn, signOut }),
    [user, session, loading, signIn, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
