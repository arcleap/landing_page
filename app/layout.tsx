import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const isPreview = process.env.VERCEL_ENV === "preview";
const siteDescription =
  "ArcLeap AI is building Human World Models: predictive intelligence for how people interact with the physical world.";

export const metadata: Metadata = {
  metadataBase: new URL("https://arcleap.ai"),
  title: "ArcLeap AI — Human World Models",
  description: siteDescription,
  openGraph: {
    title: "ArcLeap AI — Human World Models",
    description: siteDescription,
    url: "https://arcleap.ai/",
    siteName: "ArcLeap AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArcLeap AI — Human World Models",
    description: siteDescription,
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/signals/rss.xml",
    },
  },
  robots: isPreview
    ? { index: false, follow: false }
    : { index: true, follow: true },
};

const analyticsDomain = process.env.ARCLEAP_ANALYTICS_DOMAIN?.trim();
const analyticsSrc =
  process.env.ARCLEAP_ANALYTICS_SRC?.trim() ||
  "https://plausible.io/js/script.js";

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ArcLeap AI",
  legalName: "ArcLeap Inc.",
  url: "https://arcleap.ai/",
  description: siteDescription,
  slogan: "A physics engine for people.",
  founder: [{ "@type": "Person", name: "Jin Miao" }],
  foundingDate: "2026",
  foundingLocation: "Silicon Valley, California",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {analyticsDomain ? <script defer data-domain={analyticsDomain} src={analyticsSrc} /> : null}
      </head>
      <body className="flex min-h-screen flex-col bg-ground text-ink">
        <a href="#main-content" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
