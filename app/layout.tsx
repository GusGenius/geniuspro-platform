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
                const theme = localStorage.getItem('platform-theme');
                if (theme === 'dark' || !theme) {
                  document.documentElement.classList.add('dark');
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
