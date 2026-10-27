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
      {
        // The private room and its deck are never indexed or cached by anyone in between.
        source: "/room/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        // An investor's trailer link: arcleap.ai/room/<id> opens the DocSend
        // link docsend.com/view/s/<id>. DocSend can't be shown in a frame, so
        // this is a redirect; which link went to which firm lives only in DocSend.
        source: "/room/:id([a-z0-9]{16})",
        destination: "https://docsend.com/view/s/:id",
        permanent: false,
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
