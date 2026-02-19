"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

type AuthError = { message: string };
type AuthResult = { error: AuthError | null };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getString(obj: Record<string, unknown>, key: string): string | null {
  const value = obj[key];
  return typeof value === "string" ? value : null;
}

function getSessionTokens(json: unknown): { accessToken: string; refreshToken: string } | null {
  if (!isRecord(json)) return null;
  const session = json["session"];
  if (!isRecord(session)) return null;
  const accessToken = getString(session, "access_token");
  const refreshToken = getString(session, "refresh_token");
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
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

      let json: unknown = {};
      try {
        json = await res.json();
      } catch {
        json = {};
      }
      if (!res.ok) {
        const rawMessage =
          isRecord(json) && typeof json["error"] === "string"
            ? String(json["error"])
            : "Login failed";
        const errorMessage = rawMessage.includes("Invalid login credentials")
          ? "Invalid email or password."
          : rawMessage;
        return { error: { message: errorMessage } };
      }

      const tokens = getSessionTokens(json);
      if (tokens) {
        // Keep the browser Supabase client in sync (localStorage, onAuthStateChange, etc.).
        await supabase.auth.setSession({
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        });
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
