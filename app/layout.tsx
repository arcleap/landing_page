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

export const metadata: Metadata = {
  metadataBase: new URL("https://arcleap.ai"),
  title: "ArcLeap — Frontier AI, shipped as consumer products",
  description:
    "ArcLeap is a deep-tech and advanced AI company. We build world models, neural rendering, and large-scale multimodal AI — with reinforcement and continual learning at the core.",
  openGraph: {
    title: "ArcLeap — Frontier AI, shipped as consumer products",
    description:
      "Consumer deep-tech from San Francisco. Frontier AI, shipped as consumer products.",
    url: "https://arcleap.ai",
    siteName: "ArcLeap",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArcLeap — Frontier AI, shipped as consumer products",
    description:
      "Consumer deep-tech. Frontier AI, shipped as consumer products.",
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ArcLeap",
  url: "https://arcleap.ai",
  description:
    "Deep-tech and advanced AI company building consumer products.",
  founder: [{ "@type": "Person", name: "Jin Miao" }],
  foundingDate: "2026",
  foundingLocation: "San Francisco, CA",
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-ground text-ink">
        {children}
      </body>
    </html>
  );
}
