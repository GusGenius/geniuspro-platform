import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTE_PREFIXES = ["/login", "/auth/handoff"];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

function isSkippablePath(pathname: string): boolean {
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/api")) return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname === "/robots.txt") return true;
  if (pathname === "/sitemap.xml") return true;
  // Static assets (e.g. /logo.png, /fonts/foo.woff2)
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return true;
  return false;
}

function buildRedirectParam(req: NextRequest): string {
  const pathname = req.nextUrl.pathname;
  const search = req.nextUrl.search;
  return search ? `${pathname}${search}` : pathname;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isSkippablePath(pathname)) {
    return NextResponse.next();
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    // Fail closed: without env vars we can't verify auth.
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const res = NextResponse.next();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectTo = buildRedirectParam(req);
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", redirectTo);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};

