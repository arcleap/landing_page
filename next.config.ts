import type { NextConfig } from "next";

const isPreview = process.env.VERCEL_ENV === "preview";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          ...(isPreview
            ? [
                {
                  key: "X-Robots-Tag",
                  value: "noindex, nofollow, noarchive",
                },
              ]
            : []),
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.arcleap.ai" }],
        destination: "https://arcleap.ai/:path*",
        permanent: true,
      },
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
