export const nav = [
  { label: "Signals", href: "https://jinmiao.ai/signals" },
  { label: "Research", href: "#explorations" },
] as const;

export const footer = {
  email: "contact@arcleap.ai",
  founders: [
    { role: "Co-Founder & CEO", name: "Jin Miao" },
    { role: "Co-Founder", name: "Qi Guo" },
  ],
  rights: `© ${new Date().getFullYear()} ArcLeap AI, Inc.`,
} as const;
