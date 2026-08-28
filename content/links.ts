export const nav = [
  { label: "Signals", href: "/signals" },
  { label: "Direction", href: "#direction" },
  { label: "Focus", href: "#explorations" },
  { label: "Company", href: "#company" },
] as const;

export const footer = {
  tagline: "Engineering intelligence for the physical world.",
  email: "contact@arcleap.ai",
  rights: `© ${new Date().getFullYear()} ArcLeap AI, Inc.`,
} as const;
