import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const themeInitScript = `
  try {
    const stored = localStorage.getItem("arcleap-theme");
    const theme = stored === "light" || stored === "dark"
      ? stored
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.dataset.theme = "light";
  }
`;

const isPreview = process.env.VERCEL_ENV === "preview";
const siteDescription =
  "ArcLeap AI predicts how real people will respond when their world changes, and keeps score against what actually happens.";

export const metadata: Metadata = {
  metadataBase: new URL("https://arcleap.ai"),
  title: "ArcLeap AI — A Crystal Ball for the Physical World",
  description: siteDescription,
  openGraph: {
    title: "ArcLeap AI — A Crystal Ball for the Physical World",
    description: siteDescription,
    url: "https://arcleap.ai/",
    siteName: "ArcLeap AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArcLeap AI — A Crystal Ball for the Physical World",
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
  slogan: "A crystal ball for the physical world, that keeps score.",
  founder: [
    { "@type": "Person", name: "Jin Miao", jobTitle: "Founder & CEO" },
    { "@type": "Person", name: "Qi Guo", jobTitle: "Co-Founder" },
    { "@type": "Person", name: "Yifan Wang", jobTitle: "Co-Founder" },
  ],
  foundingDate: "2026",
  foundingLocation: "Silicon Valley, California",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className={inter.variable}>
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
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <a href="#main-content" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
