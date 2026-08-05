export type ProcessStep = {
  number: string;
  title: string;
  description: string;
};

export const process = {
  eyebrow: "FROM REQUEST TO PART",
  h2: "The path we’re building.",
  intro:
    "A clear sequence from what you mean to what a factory can build—with verification at every handoff.",
  steps: [
    {
      number: "01",
      title: "Describe",
      description:
        "Start with words, a sketch, reference images, and the dimensions that matter.",
    },
    {
      number: "02",
      title: "Confirm",
      description:
        "Turn the request into a clear, mutually confirmed specification.",
    },
    {
      number: "03",
      title: "Generate + verify",
      description:
        "Generate candidate designs and check geometry, physics, and manufacturability, with human review during early access.",
    },
    {
      number: "04",
      title: "Build",
      description:
        "Produce shop-ready files, a bill of materials, and a real factory price; order when ready.",
    },
  ] satisfies ProcessStep[],
} as const;
