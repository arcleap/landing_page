export const agent = {
  eyebrow: "HOW IT WORKS",
  h2: "The coding-agent loop, applied to physical products.",
  intro: "The system we’re building moves from a request to a tested design, then through manufacturing to a delivered outcome.",
  steps: [
    {
      number: "01",
      title: "Describe",
      description: "Start with plain language, a sketch, or a reference. ArcLeap turns the request into a clear specification.",
    },
    {
      number: "02",
      title: "Generate",
      description: "The agent develops an engineering design and the files needed to move it toward production.",
    },
    {
      number: "03",
      title: "Test + repair",
      description: "Geometry, physics, and manufacturability checks catch failures and guide revisions.",
    },
    {
      number: "04",
      title: "Deliver",
      description: "Qualified manufacturers quote and build. The physical outcome closes the loop.",
    },
  ],
} as const;
