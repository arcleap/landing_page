export type Founder = {
  name: string;
  role: string;
  bio: string;
  email: string;
  link?: { label: string; href: string };
};

export const company = {
  eyebrow: "Who",
  h2: "Why we started this.",
  body: [
    "AI is being built mostly for productivity and mostly for scale. We think the more interesting frontier is on the other side — AI that makes personal, emotional, human things possible for the first time.",
    "ArcLeap exists to do that work in a small, quiet, technically serious way, and to turn it into products people keep.",
  ],
  founders: [
    {
      name: "Jin Miao",
      role: "Co-founder & CEO",
      bio:
        "[placeholder — one sentence on prior work + what you do at ArcLeap]",
      email: "jinmiao@arcleap.ai",
    },
  ] satisfies Founder[],
  hiring: {
    text: "We're hiring research and product engineers in San Francisco.",
    email: "careers@arcleap.ai",
  },
};
