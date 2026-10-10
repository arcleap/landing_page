import type { CSSProperties } from "react";
import { explorations } from "@/content/explorations";
import { populationDots } from "@/lib/figures";

type Layout = { count: number; bins: number; width: number; label: number; className: string };

const wide: Layout = { count: 230, bins: 60, width: 1200, label: 12, className: "pop-wide" };
const compact: Layout = { count: 120, bins: 30, width: 600, label: 19, className: "pop-compact" };

function Dots({ count, bins, width, label, className }: Layout) {
  const { dots, tallest } = populationDots({ count, bins });
  const step = width / bins;
  const radius = step * 0.34;
  const top = label * 4;
  const baseline = top + tallest * step * 0.82 + step * 0.4;
  const height = baseline + label * 3.2;
  const y = (level: number) => baseline - (level + 0.5) * step * 0.82;

  // Spotlight one person in the smaller cluster, at the top of their stack.
  const spotlightBin = Math.round(bins * 0.8);
  const spotlight = dots.reduce(
    (best, dot, i) => (dot.bin === spotlightBin && dot.level >= (dots[best]?.level ?? -1) ? i : best),
    -1,
  );
  const spot = dots[spotlight];
  const spotX = (spot.bin + 0.5) * step;

  return (
    <svg
      className={`population ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Illustrative dot plot of a whole population split into two clusters of behavior, with one individual highlighted."
    >
      <g className="pop-dots">
        {dots.map((dot, i) =>
          i === spotlight ? null : (
            <circle
              key={i}
              cx={(dot.bin + 0.5) * step}
              cy={y(dot.level)}
              r={radius}
              style={{ "--c": dot.bin, "--l": dot.level } as CSSProperties}
            />
          ),
        )}
      </g>
      <g className="pop-spot">
        <line x1={spotX} x2={spotX} y1={label * 1.4} y2={y(spot.level) - radius * 2.2} />
        <circle className="pop-spot-ring" cx={spotX} cy={y(spot.level)} r={radius * 2} />
        <circle cx={spotX} cy={y(spot.level)} r={radius * 1.1} />
        <text x={spotX - label * 0.6} y={label * 1.9} textAnchor="end" fontSize={label}>
          {explorations.pair.person}
        </text>
      </g>
      <g className="pop-axis">
        <line x1={0} x2={width} y1={baseline + step * 0.2} y2={baseline + step * 0.2} />
        <text x={0} y={baseline + label * 2.6} fontSize={label}>
          {explorations.pair.population}
        </text>
      </g>
    </svg>
  );
}

export function Population() {
  return (
    <div className="population-figure">
      <Dots {...wide} />
      <Dots {...compact} />
    </div>
  );
}
