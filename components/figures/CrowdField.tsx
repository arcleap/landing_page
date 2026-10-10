"use client";

import { useEffect, useRef } from "react";
import { hero } from "@/content/hero";
import {
  camera,
  circle,
  clamp,
  cylinder,
  depth,
  facing,
  fit,
  prism,
  project,
  ringPath,
  roundedRect,
  seeded,
  unproject,
  type Vec2,
} from "@/lib/iso";

// A crowd on a plinth. A change moves across it — with the pointer, or on its
// own — and the people near it rise, each by their own amount.

const W = 400;
const H = 300;
const EXT = 120;
const GRID = 8;
const CELL = EXT / GRID;
const RADIUS = 3.4;
const RISE = 58;
const REACH = 40;
const PLINTH = 6;
// Strokes grade with the response: grey at rest, ink when moved, accent when moved most.
const MOVED = 0.12;
const LIT = 0.34;

const C = camera(45, 0.5, 2.1);
fit(
  C,
  [
    [-6, -6, -PLINTH],
    [EXT + 6, EXT + 6, -PLINTH],
    [EXT + 6, -6, -PLINTH],
    [-6, EXT + 6, -PLINTH],
    [-6, -6, RISE * 0.55],
  ],
  W / 2,
  H / 2,
);
const P = project(C);
const front = facing(C);

type Person = { x: number; y: number; rest: number; amp: number };

const people: Person[] = (() => {
  const rand = seeded(23);
  const out: Person[] = [];
  for (let i = 0; i < GRID; i++) {
    for (let j = 0; j < GRID; j++) {
      out.push({
        x: (i + 0.5) * CELL + (rand() - 0.5) * CELL * 0.42,
        y: (j + 0.5) * CELL + (rand() - 0.5) * CELL * 0.42,
        rest: 7 + rand() * 6,
        amp: 0.12 + 0.88 * rand() ** 1.6,
      });
    }
  }
  return out.sort((a, b) => depth(C, a.x, a.y) - depth(C, b.x, b.y));
})();

const plinth = prism(
  P,
  front,
  roundedRect(-6, -6, EXT + 6, EXT + 6, 10),
  roundedRect(-4.5, -4.5, EXT + 4.5, EXT + 4.5, 8.5),
  -PLINTH,
  0,
);

// Where the change rests, and the wander that starts from there.
const REST: Vec2 = [34, 82];
const wander = (t: number): Vec2 => [
  EXT / 2 + EXT * 0.33 * Math.sin(t * 0.31 + 3.858),
  EXT / 2 + EXT * 0.33 * Math.sin(t * 0.47 + 0.589),
];

const heightFor = (p: Person, at: Vec2) => {
  const d = Math.hypot(p.x - at[0], p.y - at[1]) / REACH;
  return p.rest + p.amp * RISE * Math.exp(-1.7 * d * d);
};
const tone = (p: Person, h: number) => {
  const rise = (h - p.rest) / RISE;
  return rise > LIT ? "sil lit" : rise > MOVED ? "sil hi" : "sil";
};
const solidFor = (p: Person, h: number) => cylinder(P, front, p.x, p.y, RADIUS, 0, h);
const markRing = (at: Vec2) => ringPath(P, circle(at[0], at[1], 4.2, 32), 0);
const markReach = (at: Vec2) => ringPath(P, circle(at[0], at[1], REACH * 0.62, 48), 0);
const readout = (at: Vec2) =>
  `X ${String(Math.round(at[0])).padStart(3, "0")} · Y ${String(Math.round(at[1])).padStart(3, "0")}`;

export function CrowdField() {
  const svgRef = useRef<SVGSVGElement>(null);
  const readRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const read = readRef.current;
    if (!svg || !read) return;

    const outlines = Array.from(svg.querySelectorAll<SVGPathElement>("[data-outline]"));
    const creases = Array.from(svg.querySelectorAll<SVGPathElement>("[data-crease]"));
    const ring = svg.querySelector<SVGPathElement>("[data-mark-ring]");
    const reach = svg.querySelector<SVGPathElement>("[data-mark-reach]");
    const dot = svg.querySelector<SVGCircleElement>("[data-mark-dot]");
    if (!ring || !reach || !dot) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const heights = people.map((p) => heightFor(p, REST));
    const speeds = people.map(() => 0);
    const mark: Vec2 = [...REST];
    const markSpeed: Vec2 = [0, 0];
    let target: Vec2 = [...REST];
    let pointing = false;
    let resumeAt = 0;
    let clock = 0;
    let frame = 0;
    let last = 0;
    let visible = true;
    let shown = readout(REST);

    // Springs from hairline's motion: k 100, c 18, substepped so a long frame can't overshoot.
    const spring = (x: number, v: number, to: number, dt: number, k: number, c: number): [number, number] => {
      const n = Math.max(1, Math.ceil(dt * 240));
      const h = dt / n;
      for (let i = 0; i < n; i++) {
        v += (-k * (x - to) - c * v) * h;
        x += v * h;
      }
      return [x, v];
    };

    const step = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      const wandering = !reduce && !pointing && now >= resumeAt;
      if (wandering) {
        clock += dt;
        target = wander(clock);
      }
      // Off the pointer the figure keeps playing: waiting to resume, then wandering.
      let moving = !reduce && !pointing;

      for (const k of [0, 1] as const) {
        if (reduce) {
          mark[k] = target[k];
          continue;
        }
        [mark[k], markSpeed[k]] = spring(mark[k], markSpeed[k], target[k], dt, 40, 12);
        if (Math.abs(mark[k] - target[k]) > 0.01 || Math.abs(markSpeed[k]) > 0.01) moving = true;
      }
      ring.setAttribute("d", markRing(mark));
      reach.setAttribute("d", markReach(mark));
      const [dx, dy] = P(mark[0], mark[1], 0);
      dot.setAttribute("cx", String(dx));
      dot.setAttribute("cy", String(dy));

      people.forEach((p, i) => {
        const goal = heightFor(p, mark);
        let h = goal;
        if (!reduce) {
          [h, speeds[i]] = spring(heights[i], speeds[i], goal, dt, 100, 18);
          if (Math.abs(h - goal) > 0.02 || Math.abs(speeds[i]) > 0.05) moving = true;
        }
        if (Math.abs(h - heights[i]) < 0.005) return;
        heights[i] = h;
        const solid = solidFor(p, h);
        outlines[i].setAttribute("d", solid.outline);
        outlines[i].setAttribute("class", tone(p, h));
        creases[i].setAttribute("d", solid.crease);
      });

      const text = readout(mark);
      if (text !== shown) {
        shown = text;
        read.textContent = text;
      }

      frame = moving && visible ? requestAnimationFrame(step) : 0;
      if (!frame) last = 0;
    };

    const kick = () => {
      if (!frame && visible) frame = requestAnimationFrame(step);
    };

    const toGround = (event: PointerEvent): Vec2 | null => {
      const matrix = svg.getScreenCTM();
      if (!matrix) return null;
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      const [x, y] = unproject(C, point.x, point.y, 0);
      return [clamp(x, 0, EXT), clamp(y, 0, EXT)];
    };
    const onMove = (event: PointerEvent) => {
      const at = toGround(event);
      if (!at) return;
      pointing = true;
      target = at;
      kick();
    };
    const onLeave = () => {
      pointing = false;
      resumeAt = performance.now() + 1600;
      kick();
    };
    const onUp = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") onLeave();
    };

    svg.addEventListener("pointermove", onMove);
    svg.addEventListener("pointerdown", onMove);
    svg.addEventListener("pointerleave", onLeave);
    svg.addEventListener("pointercancel", onLeave);
    svg.addEventListener("pointerup", onUp);

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
      else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
        last = 0;
      }
    });
    observer.observe(svg);
    resumeAt = performance.now() + 900;
    kick();

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      svg.removeEventListener("pointermove", onMove);
      svg.removeEventListener("pointerdown", onMove);
      svg.removeEventListener("pointerleave", onLeave);
      svg.removeEventListener("pointercancel", onLeave);
      svg.removeEventListener("pointerup", onUp);
    };
  }, []);

  const [restX, restY] = P(REST[0], REST[1], 0);

  return (
    <figure className="figure">
      <div className="figure-plate">
        <svg
          ref={svgRef}
          className="hl crowd"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={hero.figure.alt}
        >
          <path className="sil" d={plinth.outline} />
          <path className="nf" d={plinth.crease} />
          <path className="nf dash" d={markReach(REST)} data-mark-reach />
          <path className="nf accent" d={markRing(REST)} data-mark-ring />
          <circle className="dot" cx={restX} cy={restY} r={1.6} data-mark-dot />
          {people.map((p, i) => {
            const h = heightFor(p, REST);
            const solid = solidFor(p, h);
            return (
              <g key={i}>
                <path className={tone(p, h)} d={solid.outline} data-outline />
                <path className="nf" d={solid.crease} data-crease />
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="figure-caption">
        <span className="figure-label">{hero.figure.label}</span>
        <span className="figure-hint">{hero.figure.hint}</span>
        <span className="figure-read" ref={readRef} aria-hidden="true">
          {readout(REST)}
        </span>
      </figcaption>
    </figure>
  );
}
