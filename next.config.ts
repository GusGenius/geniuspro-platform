import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
