import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const isPreview = process.env.VERCEL_ENV === "preview";
const siteDescription =
  "ArcLeap is an independent AI company building a family of products at the intersection of intelligence and the physical world.";

export const metadata: Metadata = {
  metadataBase: new URL("https://arcleap.ai"),
  title: "ArcLeap — AI for the physical world",
  description: siteDescription,
  openGraph: {
    title: "ArcLeap — AI for the physical world",
    description: siteDescription,
    url: "https://arcleap.ai/",
    siteName: "ArcLeap",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArcLeap — AI for the physical world",
    description: siteDescription,
  },
  alternates: {
    canonical: "/",
  },
  robots: isPreview
    ? { index: false, follow: false }
    : { index: true, follow: true },
};

// Cookieless analytics, injected only when the deployment is configured.
const analyticsDomain = process.env.ARCLEAP_ANALYTICS_DOMAIN?.trim();
const analyticsSrc =
  process.env.ARCLEAP_ANALYTICS_SRC?.trim() ||
  "https://plausible.io/js/script.js";

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ArcLeap",
  url: "https://arcleap.ai/",
  description: siteDescription,
  slogan: "AI for the physical world.",
  founder: [{ "@type": "Person", name: "Jin Miao" }],
  foundingDate: "2026",
  foundingLocation: "Silicon Valley, California",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {analyticsDomain ? (
          <script defer data-domain={analyticsDomain} src={analyticsSrc} />
        ) : null}
      </head>
      <body className="flex min-h-screen flex-col bg-ground text-ink">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
