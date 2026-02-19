import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@geniuspro/ui-shared"],
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      {
        source: "/swarms",
        destination: "/cats",
        permanent: true,
      },
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
