export type Pillar = {
  number: string;
  title: string;
  body: string;
  status: "production" | "research";
  tag: string;
};

export const pillars = {
  eyebrow: "What we work on",
  h2: "Four problems we're taking seriously.",
  items: [
    {
      number: "01",
      title: "Personal World Models",
      body:
        "A compact, private 3D model of a person's life — the places they live, the people around them, the objects that recur. Small enough to live on a phone.",
      status: "production",
      tag: "In production · Dreamist",
    },
    {
      number: "02",
      title: "Neural Rendering at Consumer Cost",
      body:
        "Gaussian splatting plus artistic style transfer, tuned so a full day reconstructs for cents — not dollars. The difference between a research demo and a product.",
      status: "production",
      tag: "In production · Dreamist",
    },
    {
      number: "03",
      title: "On-device Inference",
      body:
        "Audio transcription, keyframe selection, and scene segmentation that run on the phone or the pin. Your raw life never leaves the device in readable form.",
      status: "production",
      tag: "In production · Dreamist",
    },
    {
      number: "04",
      title: "Authenticity & Provenance",
      body:
        "Cryptographic attestation from sensor to rendered scene. In a world of AI fiction, we build the layer that proves a moment was lived.",
      status: "production",
      tag: "In production · Dreamist",
    },
  ] satisfies Pillar[],
};
