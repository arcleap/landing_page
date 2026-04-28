export type Founder = {
  name: string;
  role: string;
  email: string;
  link?: { label: string; href: string };
};

export const company = {
  eyebrow: "Who",
  h2: "Why we started this.",
  body: [
    "AI is being built mostly for productivity and mostly for scale. We think the more interesting frontier is on the other side — AI that makes personal, emotional, human things possible for the first time.",
    "ArcLeap is where that frontier gets shipped — research, infrastructure, and consumer products that bring advanced AI into daily life.",
  ],
  founders: [
    {
      name: "Jin Miao",
      role: "Co-founder & CEO",
      email: "jinmiao@arcleap.ai",
    },
  ] satisfies Founder[],
  hiring: {
    text: "We're hiring research and product engineers in Silicon Valley.",
    email: "careers@arcleap.ai",
  },
};
