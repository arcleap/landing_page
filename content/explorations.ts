export const explorations = {
  eyebrow: "PREDICTION, NOT GENERATION",
  generation: "Most AI for the physical world makes one plausible guess.",
  prediction: {
    before: "We predict ",
    emphasis: "the full range",
    after: " of what real people may do.",
  },
  pair: {
    eyebrow: "PHYSICALITY + PSYCHOLOGY",
    detail:
      "We model how people move and what they intend and feel, from whole populations to each person.",
    sides: [
      { name: "Physicality", question: "How people move", traits: ["Move", "Reach", "Carry", "Tire"] },
      { name: "Psychology", question: "What they intend and feel", traits: ["Intend", "Notice", "Feel"] },
    ],
    population: "WHOLE POPULATION",
    person: "EACH PERSON",
  },
  loop: {
    eyebrow: "THE LOOP",
    h2: ["Predict.", "Measure.", "Learn."],
    proof:
      "Every forecast is made before a change and scored after. Each real outcome sharpens the next prediction, using data built with partners change by change.",
    steps: [
      { number: "01", title: "Predict", body: "Forecast the full range of responses before a change is made." },
      { number: "02", title: "Measure", body: "Score the forecast against what real people actually do." },
      { number: "03", title: "Learn", body: "Each real outcome sharpens the next prediction." },
    ],
    returnLabel: "OUTCOME → NEXT PREDICTION",
    observed: "OBSERVED",
  },
  applicationLabel: "WHERE IT APPLIES",
  items: [
    { number: "01", signal: "ROBOTS", title: "Robots that work around people" },
    { number: "02", signal: "PRODUCTS & SPACES", title: "Physical products and spaces" },
    {
      number: "03",
      signal: "GENERATED MEDIA",
      title: "Generated media that needs real human behavior",
    },
  ],
} as const;
