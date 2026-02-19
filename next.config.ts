import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@geniuspro/ui-shared"],
  turbopack: {
    // Monorepo root (so Turbopack can resolve hoisted deps).
    root: path.resolve(__dirname, ".."),
  },
  async redirects() {
    return [
      {
        source: "/routers",
        destination: "/cats",
        permanent: true,
      },
      {
        source: "/routers/:path*",
        destination: "/cats",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
