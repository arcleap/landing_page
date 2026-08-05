export const nav = [
  { label: "Direction", href: "#direction" },
  { label: "Work", href: "#work" },
  { label: "Company", href: "#company" },
  { label: "Contact", href: "#contact" },
] as const;

export const footer = {
  tagline: "Building AI that belongs in the world.",
  email: "contact@arcleap.ai",
  rights: `© ${new Date().getFullYear()} ArcLeap, Inc.`,
} as const;
