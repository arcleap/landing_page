import type { CSSProperties } from "react";
import { hero } from "@/content/hero";
import { outcomeField, type FieldLayout } from "@/lib/figures";

const wide: FieldLayout = {
  width: 1200,
  height: 470,
  originX: 96,
  outcomeX: 984,
  top: 74,
  bottom: 430,
  densityWidth: 150,
  paths: 120,
  travelers: 16,
};

const compact: FieldLayout = {
  width: 600,
  height: 660,
  originX: 30,
  outcomeX: 446,
  top: 104,
  bottom: 604,
  densityWidth: 112,
  paths: 80,
  travelers: 10,
};

const labels = hero.figure;

type Variant = "wide" | "compact";

function Field({ layout, label, variant }: { layout: FieldLayout; label: number; variant: Variant }) {
  const field = outcomeField(layout);
  const { originX, outcomeX, top, bottom } = layout;
  const lineTop = top - label * 1.6;
  const textY = top - label * 2.4;
  // On narrow screens the top row only fits two labels, so "after" moves to
  // the foot of its axis line.
  const stacked = variant === "compact";

  return (
    <svg
      className={`outcome-field of-${variant}`}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      role="img"
      aria-label="Illustrative chart. From a single change, many curved paths fan out to two clusters of outcomes. One straight dashed line, a single plausible guess, lands in the empty gap between them."
      style={{ "--label": `${label}px` } as CSSProperties}
    >
      <g className="of-axis">
        <line x1={originX} x2={originX} y1={lineTop} y2={bottom + label} />
        <line x1={outcomeX} x2={outcomeX} y1={lineTop} y2={bottom + label * (stacked ? 1.4 : 1)} />
      </g>
      <g className="of-labels">
        <text x={originX + label * 0.7} y={textY}>{labels.before}</text>
        <text
          x={outcomeX - label * 0.7}
          y={stacked ? bottom + label * 2.3 : textY}
          textAnchor="end"
        >
          {labels.after}
        </text>
        <text
          x={stacked ? layout.width : field.densityX + label * 0.4}
          y={textY}
          textAnchor={stacked ? "end" : "start"}
          className="of-label-accent"
        >
          {labels.range}
        </text>
      </g>

      <path className="of-density" d={field.densityPath} />
      <path className="of-density-line" d={field.densityLine} pathLength={1} />

      <g className="of-paths">
        {field.people.map((p, i) => (
          <path
            key={i}
            d={p.d}
            pathLength={1}
            style={{ "--d": `${p.delay}ms`, strokeOpacity: p.opacity } as CSSProperties}
          />
        ))}
      </g>
      <g className="of-ends">
        {field.people.map((p, i) => (
          <circle key={i} cx={outcomeX} cy={p.endY} r={label * 0.13} />
        ))}
      </g>

      <g className="of-guess">
        <line x1={originX} y1={field.guessY} x2={outcomeX} y2={field.guessY} />
        <path
          d={`M${outcomeX - label * 0.45} ${field.guessY - label * 0.45}l${label * 0.9} ${label * 0.9}m0 ${-label * 0.9}l${-label * 0.9} ${label * 0.9}`}
        />
        <text x={outcomeX - label * 1.4} y={field.guessY - label * 0.9} textAnchor="end">
          {labels.guess}
        </text>
      </g>

      <g className="of-person">
        <path d={field.person.d} pathLength={1} />
        <circle className="of-person-end" cx={outcomeX} cy={field.person.endY} r={label * 0.42} />
        <text x={outcomeX - label * 1.2} y={field.person.endY + label * 2} textAnchor="end">
          {labels.person}
        </text>
      </g>

      <g className="of-travelers" aria-hidden="true">
        {field.travelers.map((t, i) => (
          <circle key={i} r={label * 0.24} opacity={0}>
            <animateMotion dur={`${t.duration}s`} begin={`${t.begin}s`} repeatCount="indefinite" path={t.d} />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.1;0.86;1"
              dur={`${t.duration}s`}
              begin={`${t.begin}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>

      <g className="of-origin">
        <circle className="of-origin-ring" cx={originX} cy={field.originY} r={label * 1.1} />
        <circle className="of-origin-dot" cx={originX} cy={field.originY} r={label * 0.46} />
        <text x={originX} y={field.originY + label * 2.6} textAnchor={stacked ? "start" : "middle"}>
          {labels.change}
        </text>
      </g>
    </svg>
  );
}

export function OutcomeField() {
  return (
    <figure className="outcome-figure">
      <div className="outcome-frame">
        <Field layout={wide} label={12} variant="wide" />
        <Field layout={compact} label={19} variant="compact" />
      </div>
      <figcaption className="figure-caption">
        <span>{labels.label}</span>
        <span>{labels.caption}</span>
      </figcaption>
    </figure>
  );
}
