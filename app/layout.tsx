import type { Metadata } from "next";
import Script from "next/script";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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

const themeInitScript = `
  try {
    const savedTheme = localStorage.getItem("arcleap-theme");
    document.documentElement.dataset.theme =
      savedTheme === "dark" ? "dark" : "light";
  } catch {
    document.documentElement.dataset.theme = "light";
  }
`;

const isPreview = process.env.VERCEL_ENV === "preview";
const siteDescription =
  "ArcLeap AI turns frontier advances into products that help more people imagine, create, and make things real.";

export const metadata: Metadata = {
  metadataBase: new URL("https://arcleap.ai"),
  title: "ArcLeap AI — Frontier AI for more people",
  description: siteDescription,
  openGraph: {
    title: "ArcLeap AI — Frontier AI for more people",
    description: siteDescription,
    url: "https://arcleap.ai/",
    siteName: "ArcLeap AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArcLeap AI — Frontier AI for more people",
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
  slogan: "Frontier AI for more people.",
  founder: [{ "@type": "Person", name: "Jin Miao" }],
  foundingDate: "2026",
  foundingLocation: "Silicon Valley, California",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrains.variable}`}
    >
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
