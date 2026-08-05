export const nav = [
  { label: "How it works", href: "#how" },
  { label: "Who it is for", href: "#builders" },
  { label: "Company", href: "#company" },
  { label: "Contact", href: "#contact" },
] as const;

export const footer = {
  tagline: "The compiler between wanting and making.",
  email: "contact@arcleap.ai",
  rights: `© ${new Date().getFullYear()} ArcLeap, Inc.`,
} as const;
