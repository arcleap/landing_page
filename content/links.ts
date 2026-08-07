export const nav = [
  { label: "Direction", href: "#direction" },
  { label: "Explorations", href: "#explorations" },
  { label: "Company", href: "#company" },
] as const;

export const footer = {
  tagline: "Make more possible.",
  email: "contact@arcleap.ai",
  rights: `© ${new Date().getFullYear()} ArcLeap, Inc.`,
} as const;
