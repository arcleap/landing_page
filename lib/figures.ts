// Deterministic, illustrative geometry for the page's figures. Everything is
// seeded so the server render is stable and every visitor sees the same
// picture. None of this is model output — the figures are labeled as such.

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand: () => number) {
  const u = 1 - rand();
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Two clusters of human response with an empty middle: the average of the
// population lands where almost nobody actually is.
const modes = [
  { mean: 0.24, sd: 0.085, weight: 0.58 },
  { mean: 0.74, sd: 0.075, weight: 0.42 },
];

export const meanOutcome = modes.reduce((sum, m) => sum + m.mean * m.weight, 0);

function sampleOutcome(rand: () => number) {
  const mode = rand() < modes[0].weight ? modes[0] : modes[1];
  return Math.min(0.97, Math.max(0.03, mode.mean + gaussian(rand) * mode.sd));
}

function density(z: number) {
  return modes.reduce(
    (sum, m) => sum + (m.weight / m.sd) * Math.exp(-0.5 * ((z - m.mean) / m.sd) ** 2),
    0,
  );
}

const r = (n: number) => Math.round(n * 10) / 10;

export type FieldLayout = {
  width: number;
  height: number;
  originX: number;
  outcomeX: number;
  top: number;
  bottom: number;
  densityWidth: number;
  paths: number;
  travelers: number;
};

export function outcomeField(layout: FieldLayout, seed = 7) {
  const rand = seeded(seed);
  const span = layout.bottom - layout.top;
  const toY = (z: number) => layout.top + z * span;
  const originY = toY(meanOutcome);
  const run = layout.outcomeX - layout.originX;

  const route = (z: number, wobble: number[]) => {
    const endY = toY(z);
    const rise = endY - originY;
    const midX = layout.originX + run * 0.5 + wobble[0] * run * 0.02;
    const midY = originY + rise * 0.42 + wobble[1] * span * 0.06;
    return {
      d:
        `M${r(layout.originX)} ${r(originY)}` +
        `C${r(layout.originX + run * 0.24)} ${r(originY + wobble[2] * span * 0.02)},` +
        `${r(midX - run * 0.12)} ${r(midY - rise * 0.14)},${r(midX)} ${r(midY)}` +
        `S${r(layout.originX + run * 0.82)} ${r(endY + wobble[3] * span * 0.03)},` +
        `${r(layout.outcomeX)} ${r(endY)}`,
      endY: r(endY),
    };
  };

  const people = Array.from({ length: layout.paths }, (_, i) => {
    const z = sampleOutcome(rand);
    const wobble = [gaussian(rand), gaussian(rand), gaussian(rand), gaussian(rand)];
    return { ...route(z, wobble), opacity: r(0.12 + rand() * 0.2), delay: i * 9 };
  });

  const person = route(0.79, [0.4, -0.6, 0.8, -0.3]);

  const travelers = Array.from({ length: layout.travelers }, (_, i) => {
    const source = people[Math.floor(rand() * people.length)];
    return { d: source.d, duration: r(3.4 + rand() * 2.6), begin: r(1.6 + i * 0.41) };
  });

  const steps = 90;
  const peak = Math.max(...Array.from({ length: steps + 1 }, (_, i) => density(i / steps)));
  const x0 = layout.outcomeX + 14;
  const curve = Array.from({ length: steps + 1 }, (_, i) => {
    const z = i / steps;
    return `${r(x0 + (density(z) / peak) * layout.densityWidth)} ${r(toY(z))}`;
  });

  return {
    originY: r(originY),
    guessY: r(toY(meanOutcome)),
    people,
    person,
    travelers,
    densityX: x0,
    densityPath: `M${x0} ${r(layout.top)}L${curve.join("L")}L${x0} ${r(layout.bottom)}Z`,
    densityLine: `M${curve.join("L")}`,
  };
}

// A stacked dot plot of one population, built from the same two clusters.
export function populationDots({
  count,
  bins,
  seed = 11,
}: {
  count: number;
  bins: number;
  seed?: number;
}) {
  const rand = seeded(seed);
  const stacks = new Array<number>(bins).fill(0);
  const dots = Array.from({ length: count }, () => {
    const bin = Math.min(bins - 1, Math.floor(sampleOutcome(rand) * bins));
    const level = stacks[bin]++;
    return { bin, level };
  });
  return { dots, tallest: Math.max(...stacks) };
}

// The same two clusters drawn as a curve along x, for the small loop figures.
// `sharpen` below 1 narrows both clusters; above 1 widens them. The curve is
// scaled so its tallest point sits `peak` above the baseline.
export function distributionCurve({
  width,
  baseline,
  peak,
  sharpen = 1,
}: {
  width: number;
  baseline: number;
  peak: number;
  sharpen?: number;
}) {
  const steps = 80;
  const values = Array.from({ length: steps + 1 }, (_, i) =>
    modes.reduce((sum, m) => {
      const sd = m.sd * sharpen;
      return sum + (m.weight / sd) * Math.exp(-0.5 * ((i / steps - m.mean) / sd) ** 2);
    }, 0),
  );
  const tallest = Math.max(...values);
  const points = values.map((v, i) => `${r((i / steps) * width)} ${r(baseline - (v / tallest) * peak)}`);
  return {
    line: `M${points.join("L")}`,
    area: `M0 ${baseline}L${points.join("L")}L${width} ${baseline}Z`,
    xAt: (z: number) => r(z * width),
  };
}
