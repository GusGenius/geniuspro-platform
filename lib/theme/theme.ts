export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "platform-theme";
export const THEME_COOKIE_NAME = "gp_theme";
export const THEME_CHANGE_EVENT = "gp-theme-changed";

function isTheme(value: string | null | undefined): value is Theme {
  return value === "light" || value === "dark";
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";").map((p) => p.trim());
  for (const part of parts) {
    if (!part) continue;
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq);
    if (key !== name) continue;
    return decodeURIComponent(part.slice(eq + 1));
  }
  return null;
}

function buildCookieOptions(): string {
  const base = "path=/; max-age=31536000; samesite=lax; secure";
  if (typeof window !== "undefined" && window.location.hostname.endsWith(".geniuspro.io")) {
    return `${base}; domain=.geniuspro.io`;
  }
  return base;
}

export function applyThemeToDOM(theme: Theme) {
  if (typeof document === "undefined") return;
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function getStoredTheme(): Theme | null {
  const cookieTheme = readCookie(THEME_COOKIE_NAME);
  if (isTheme(cookieTheme)) return cookieTheme;
  if (typeof localStorage === "undefined") return null;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (isTheme(stored)) return stored;
  return null;
}

export function setStoredTheme(theme: Theme) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
  if (typeof document !== "undefined") {
    document.cookie = `${THEME_COOKIE_NAME}=${encodeURIComponent(theme)}; ${buildCookieOptions()}`;
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }
}

