export const nav = [
  { label: "Signals", href: "https://jinmiao.ai/signals" },
  { label: "Approach", href: "#approach" },
] as const;

export const footer = {
  email: "contact@arcleap.ai",
  label: "WORK WITH US",
  question: "Building robots that work around people, or physical products and spaces?",
  ask: "We’re looking for data and design partners.",
  founders: [
    { role: "Founder & CEO", name: "Jin Miao" },
    { role: "Co-Founder", name: "Qi Guo" },
    { role: "Co-Founder", name: "Yifan Wang" },
  ],
  rights: `© ${new Date().getFullYear()} ArcLeap AI, Inc.`,
} as const;
