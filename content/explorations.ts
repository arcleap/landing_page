export const explorations = {
  eyebrow: "PREDICTION, NOT GENERATION",
  h2: "One plausible picture is not enough.",
  intro:
    "Most AI built for the physical world generates one plausible picture of what might happen. ArcLeap AI predicts.",
  detail:
    "Before a robot update ships, a space is rebuilt, or a product launches, our models run thousands of possible futures for the people it touches and return the full range: what is most likely, how much it varies, and what could go wrong.",
  proof:
    "Every forecast is logged before reality happens and checked afterward, so the predictions can get sharper with every change. We are building the infrastructure layer for physical AI that models the people.",
  applicationLabel: "WHERE IT APPLIES",
  items: [
    {
      number: "01",
      signal: "ROBOTS",
      title: "Robots that work around people",
      description:
        "Model the range of human responses before a robot update ships.",
    },
    {
      number: "02",
      signal: "PRODUCTS & SPACES",
      title: "Physical products and spaces",
      description:
        "Explore how people may use and adapt before a product launches or a space is rebuilt.",
    },
    {
      number: "03",
      signal: "GENERATED MEDIA",
      title: "Generated people that behave like people",
      description:
        "Judge whether movement and behavior in a generated scene hold up against real human behavior.",
    },
  ],
} as const;
