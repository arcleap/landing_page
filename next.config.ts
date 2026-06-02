import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/signals",
        destination: "/signals/index.html",
      },
    ];
  },
};

export default nextConfig;
