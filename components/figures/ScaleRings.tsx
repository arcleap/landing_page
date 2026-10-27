"use client";

import { useEffect, useRef } from "react";
import { explorations } from "@/content/explorations";
import {
  camera,
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
} from "@/lib/iso";

// Rings a decade apart, from a centimeter out to a kilometer, with people
// standing among them. A change spreads from the middle, ring by ring, and each
// person rises as it reaches them. Pointing at a ring reads its scale.

const { scale } = explorations;
const W = 400;
const H = 270;
const BASE = 7;
const STEP = 1.62;
const LAST = scale.stops.length - 1;
const half = (i: number) => BASE * STEP ** i;
const OUT = half(LAST);
const RADIUS = 3;
const GROW = 5.2;
const PAUSE = 1.4;
const HELD = 1.1;

const C = camera(45, 0.5, 1.6);
fit(
  C,
  [
    [-OUT - 4, -OUT - 4, -4],
    [OUT + 4, OUT + 4, -4],
    [OUT + 4, -OUT - 4, -4],
    [-OUT - 4, OUT + 4, -4],
    [0, 0, 30],
  ],
  W / 2,
  H / 2,
);
const P = project(C);
const front = facing(C);

const square = (h: number) => roundedRect(-h, -h, h, h, h * 0.3, 6);
const rings = scale.stops.map((_, i) => ringPath(P, square(half(i)), 0));
const plinth = prism(P, front, square(OUT + 5), square(OUT + 3.5), -4, 0);
const [cx, cy] = P(0, 0, 0);

type Person = { x: number; y: number; d: number; h: number };

// One person in the middle, then more in each wider band (the two innermost
// bands are too narrow to stand in).
const people: Person[] = (() => {
  const rand = seeded(11);
  const out: Person[] = [{ x: 0, y: 0, d: 0, h: 26 }];
  [0, 1, 2, 3, 4].forEach((count, i) => {
    const inner = half(i) + 2;
    const outer = half(i + 1) - 2;
    for (let n = 0, tries = 0; n < count && tries < 400; tries++) {
      const x = (rand() * 2 - 1) * outer;
      const y = (rand() * 2 - 1) * outer;
      const d = Math.max(Math.abs(x), Math.abs(y));
      if (d < inner || out.some((p) => Math.hypot(p.x - x, p.y - y) < RADIUS * 3)) continue;
      out.push({ x, y, d, h: 16 + rand() * 9 });
      n++;
    }
  });
  return out.sort((a, b) => depth(C, a.x, a.y) - depth(C, b.x, b.y));
})();

const solids = people.map((p) => cylinder(P, front, p.x, p.y, RADIUS, 0, p.h));
const ringAt = (d: number) => clamp(Math.ceil(Math.log(Math.max(d, BASE) / BASE) / Math.log(STEP) - 1e-6), 0, LAST);
const bandOf = (p: Person) => ringAt(p.d);
const pulseScale = (t: number) => STEP ** (t * LAST);

export function ScaleRings() {
  const svgRef = useRef<SVGSVGElement>(null);
  const readRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const read = readRef.current;
    if (!svg || !read) return;

    const ringEls = Array.from(svg.querySelectorAll<SVGPathElement>("[data-ring]"));
    const personEls = Array.from(svg.querySelectorAll<SVGGElement>("[data-person]"));
    const pulse = svg.querySelector<SVGPathElement>("[data-pulse]");
    if (!pulse) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hitAt = people.map(() => -Infinity);
    let pointed = -1;
    let resumeAt = 0;
    let start = 0;
    let frame = 0;
    let visible = true;
    let shown = "";

    const show = (text: string) => {
      if (text === shown) return;
      shown = text;
      read.textContent = text;
    };
    const setRing = (k: number) => ringEls.forEach((el, i) => el.classList.toggle("hi", i === k));
    const setPeople = (lit: (i: number) => boolean) =>
      personEls.forEach((el, i) => el.classList.toggle("is-hit", lit(i)));

    const step = (now: number) => {
      frame = 0;
      if (pointed >= 0) return;
      if (now < resumeAt) {
        frame = requestAnimationFrame(step);
        return;
      }
      if (!start) start = now;
      const t = (now - start) / 1000;
      if (t > GROW + PAUSE) start = now;
      const p = Math.min(1, ((now - start) / 1000) / GROW);
      const s = pulseScale(p);
      const reach = BASE * s;
      pulse.setAttribute("transform", `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`);
      pulse.style.opacity = p >= 1 ? "0" : String(Math.min(1, p * 12, (1 - p) * 6));
      people.forEach((person, i) => {
        if (p < 1 && person.d <= reach && now - hitAt[i] > (GROW + PAUSE) * 1000 * 0.9) hitAt[i] = now;
      });
      setPeople((i) => now - hitAt[i] < HELD * 1000);
      show(scale.stops[p < 1 ? ringAt(reach - 0.5) : LAST]);
      if (visible) frame = requestAnimationFrame(step);
    };

    const kick = () => {
      if (!reduce && !frame && visible && pointed < 0) frame = requestAnimationFrame(step);
    };

    const onMove = (event: PointerEvent) => {
      const matrix = svg.getScreenCTM();
      if (!matrix) return;
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      const [x, y] = unproject(C, point.x, point.y, 0);
      const d = Math.max(Math.abs(x), Math.abs(y));
      if (d > OUT + 6) return onLeave();
      pointed = ringAt(d);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      pulse.style.opacity = "0";
      setRing(pointed);
      setPeople((i) => bandOf(people[i]) === pointed);
      show(scale.stops[pointed]);
    };
    const onLeave = () => {
      if (pointed < 0) return;
      pointed = -1;
      setRing(-1);
      setPeople(() => false);
      show(scale.range);
      start = 0;
      resumeAt = performance.now() + 900;
      kick();
    };

    svg.addEventListener("pointermove", onMove);
    svg.addEventListener("pointerdown", onMove);
    svg.addEventListener("pointerleave", onLeave);
    svg.addEventListener("pointercancel", onLeave);

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
      else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    observer.observe(svg);
    resumeAt = performance.now() + 600;
    kick();

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      svg.removeEventListener("pointermove", onMove);
      svg.removeEventListener("pointerdown", onMove);
      svg.removeEventListener("pointerleave", onLeave);
      svg.removeEventListener("pointercancel", onLeave);
    };
  }, []);

  return (
    <figure className="figure">
      <div className="figure-plate">
        <svg ref={svgRef} className="hl scale" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={scale.figure.alt}>
          <path className="sil" d={plinth.outline} />
          <path className="nf" d={plinth.crease} />
          {rings.map((d, i) => (
            <path key={i} className="nf" d={d} data-ring />
          ))}
          <path className="nf accent" d={rings[0]} data-pulse style={{ opacity: 0 }} />
          {people.map((p, i) => (
            <g key={i} className="scale-person" data-person>
              <path className="sil" d={solids[i].outline} />
              <path className="nf" d={solids[i].crease} />
            </g>
          ))}
        </svg>
      </div>
      <figcaption className="figure-caption">
        <span className="figure-label">{scale.figure.label}</span>
        <span className="figure-hint">{scale.figure.hint}</span>
        <span className="figure-read" ref={readRef} aria-hidden="true">
          {scale.range}
        </span>
      </figcaption>
    </figure>
  );
}
