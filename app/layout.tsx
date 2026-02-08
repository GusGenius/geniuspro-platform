import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/layout/Layout";
import { AuthProvider } from "@/lib/auth/auth-context";

export const metadata: Metadata = {
  title: "GeniusPro Platform",
  description: "GeniusPro AI Developer Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        {/* Prevent flash of wrong theme - default to dark */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getCookie(name) {
                  const parts = document.cookie.split(';').map(p => p.trim());
                  for (const part of parts) {
                    if (!part) continue;
                    const eq = part.indexOf('=');
                    if (eq === -1) continue;
                    const key = part.slice(0, eq);
                    if (key !== name) continue;
                    return decodeURIComponent(part.slice(eq + 1));
                  }
                  return null;
                }
                const cookieTheme = getCookie('gp_theme');
                const theme = (cookieTheme === 'light' || cookieTheme === 'dark')
                  ? cookieTheme
                  : localStorage.getItem('platform-theme');
                if (theme === 'dark' || !theme) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <Layout>{children}</Layout>
        </AuthProvider>
      </body>
    </html>
  );
}
