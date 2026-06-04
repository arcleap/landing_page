import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Signals has moved to jinmiao.ai. Permanently redirect the old arcleap.ai/signals
  // paths there. The rest of arcleap.ai (the company site) is unchanged.
  async redirects() {
    return [
      {
        source: "/signals",
        destination: "https://jinmiao.ai/signals",
        permanent: true,
      },
      {
        source: "/signals/:path*",
        destination: "https://jinmiao.ai/signals/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
