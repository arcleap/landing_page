import type { CSSProperties } from "react";
import { explorations } from "@/content/explorations";
import { distributionCurve, outcomeField } from "@/lib/figures";

const width = 260;
const height = 150;
const baseline = 128;

export function PredictFigure() {
  const field = outcomeField({
    width,
    height,
    originX: 14,
    outcomeX: 214,
    top: 14,
    bottom: 136,
    densityWidth: 34,
    paths: 34,
    travelers: 0,
  });
  return (
    <svg className="loop-figure" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path className="lf-area" d={field.densityPath} />
      <path className="lf-accent" d={field.densityLine} />
      <g className="lf-paths">
        {field.people.map((p, i) => (
          <path
            key={i}
            d={p.d}
            pathLength={1}
            style={{ "--d": `${i * 22}ms`, strokeOpacity: p.opacity + 0.12 } as CSSProperties}
          />
        ))}
      </g>
      <circle className="lf-dot" cx={14} cy={field.originY} r={4} />
    </svg>
  );
}

export function MeasureFigure() {
  const curve = distributionCurve({ width, baseline, peak: 92 });
  const observed = curve.xAt(0.3);
  return (
    <svg className="loop-figure" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path className="lf-area" d={curve.area} />
      <path className="lf-line" d={curve.line} />
      <line className="lf-base" x1={0} x2={width} y1={baseline} y2={baseline} />
      <g className="lf-observed">
        <line x1={observed} x2={observed} y1={18} y2={baseline} />
        <circle cx={observed} cy={18} r={4.5} />
        <text x={observed + 10} y={22}>{explorations.loop.observed}</text>
      </g>
    </svg>
  );
}

export function LearnFigure() {
  const before = distributionCurve({ width, baseline, peak: 50, sharpen: 1.6 });
  const next = distributionCurve({ width, baseline, peak: 104, sharpen: 0.72 });
  return (
    <svg className="loop-figure" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path className="lf-faint" d={before.line} />
      <path className="lf-area" d={next.area} />
      <path className="lf-accent lf-draw" d={next.line} pathLength={1} />
      <line className="lf-base" x1={0} x2={width} y1={baseline} y2={baseline} />
    </svg>
  );
}
