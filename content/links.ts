export const nav = [
  { label: "Signals", href: "https://jinmiao.ai/signals" },
  { label: "Direction", href: "#approach" },
] as const;

export const site = {
  running: "ARCLEAP AI",
} as const;

export const footer = {
  email: "contact@arcleap.ai",
  number: "03",
  label: "CONTACT",
  question: "Building something that works around people?",
  ask: "We’d like to hear from you.",
  founders: [
    { role: "Founder & CEO", name: "Jin Miao" },
    { role: "Co-Founder", name: "Qi Guo" },
    { role: "Co-Founder", name: "Yifan Wang" },
  ],
  rights: `© ${new Date().getFullYear()} ArcLeap AI, Inc.`,
} as const;
