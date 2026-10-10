import type { Metadata } from "next";
import Script from "next/script";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const themeInitScript = `
  document.documentElement.classList.add("js");
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
  "ArcLeap AI is building models that test robots, products, and spaces against real human behavior at software speed and scale.";

export const metadata: Metadata = {
  metadataBase: new URL("https://arcleap.ai"),
  title: "ArcLeap AI — Physicality and Psychology, Predicted Together",
  description: siteDescription,
  openGraph: {
    title: "ArcLeap AI — Physicality and Psychology, Predicted Together",
    description: siteDescription,
    url: "https://arcleap.ai/",
    siteName: "ArcLeap AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArcLeap AI — Physicality and Psychology, Predicted Together",
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
  slogan: "Predict how people will respond, before you change their world.",
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
    <html lang="en" data-theme="light" suppressHydrationWarning className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}>
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
