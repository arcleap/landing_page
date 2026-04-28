export type Pillar = {
  number: string;
  title: string;
};

export const pillars = {
  eyebrow: "What we work on",
  h2: "Four problems we're taking seriously.",
  items: [
    { number: "01", title: "Personal World Models" },
    { number: "02", title: "Neural Rendering at Consumer Cost" },
    { number: "03", title: "Per-user Personalization at Scale" },
    { number: "04", title: "Authenticity & Provenance" },
  ] satisfies Pillar[],
};
