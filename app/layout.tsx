import type { Metadata } from "next";
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

const isPreview = process.env.VERCEL_ENV === "preview";
const siteDescription =
  "ArcLeap is an independent AI company bringing frontier capabilities into products that expand what people can imagine, create, and make real.";

export const metadata: Metadata = {
  metadataBase: new URL("https://arcleap.ai"),
  title: "ArcLeap — Frontier AI for human possibility",
  description: siteDescription,
  openGraph: {
    title: "ArcLeap — Frontier AI for human possibility",
    description: siteDescription,
    url: "https://arcleap.ai/",
    siteName: "ArcLeap",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArcLeap — Frontier AI for human possibility",
    description: siteDescription,
  },
  alternates: { canonical: "/" },
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
  name: "ArcLeap",
  url: "https://arcleap.ai/",
  description: siteDescription,
  slogan: "Frontier intelligence. Shared possibility.",
  founder: [{ "@type": "Person", name: "Jin Miao" }],
  foundingDate: "2026",
  foundingLocation: "Silicon Valley, California",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
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
