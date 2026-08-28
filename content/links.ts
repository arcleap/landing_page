export const nav = [
  { label: "Signals", href: "/signals" },
  { label: "Approach", href: "#direction" },
  { label: "Loop", href: "#explorations" },
  { label: "Company", href: "#company" },
] as const;

export const footer = {
  tagline: "Engineering intelligence for the physical world.",
  email: "contact@arcleap.ai",
  rights: `© ${new Date().getFullYear()} ArcLeap AI, Inc.`,
} as const;
