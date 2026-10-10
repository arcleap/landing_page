// Isometric line drawing in the hairline manner (github.com/lucasmarkes/hairline,
// MIT © Lucas Marques): an orthographic camera, rounded prisms whose outline is
// the hull of their top and bottom rings, plates filled with the page colour and
// painted back to front. World x/y lie on the ground, z points up.

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Sample = { u: number; v: number; nu: number; nv: number };
export type Camera = { az: number; k: number; S: number; ox: number; oy: number };
export type Projector = (x: number, y: number, z: number) => Vec2;

const rad = (deg: number) => (deg * Math.PI) / 180;
const r2 = (n: number) => Math.round(n * 100) / 100;

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** `k` is sin(elevation); 0.5 gives the 2:1 view. */
export const camera = (azDeg: number, k: number, S: number): Camera => ({ az: rad(azDeg), k, S, ox: 0, oy: 0 });

export function project(C: Camera): Projector {
  const c = Math.cos(C.az);
  const s = Math.sin(C.az);
  const zf = Math.sqrt(1 - C.k * C.k);
  return (x, y, z) => {
    const X = x * c - y * s;
    const Y = x * s + y * c;
    return [C.ox + C.S * X, C.oy + C.S * (Y * C.k - z * zf)];
  };
}

/** The ground point at height z under a screen point. */
export function unproject(C: Camera, sx: number, sy: number, z: number): Vec2 {
  const c = Math.cos(C.az);
  const s = Math.sin(C.az);
  const zf = Math.sqrt(1 - C.k * C.k);
  const X = (sx - C.ox) / C.S;
  const Y = ((sy - C.oy) / C.S + z * zf) / C.k;
  return [X * c + Y * s, -X * s + Y * c];
}

/** How near a ground point is to the viewer; paint in ascending order. */
export const depth = (C: Camera, x: number, y: number) => x * Math.sin(C.az) + y * Math.cos(C.az);

/** Offsets the camera so the projected bounds of `pts` centre on (cx, cy). */
export function fit(C: Camera, pts: readonly Vec3[], cx: number, cy: number) {
  C.ox = 0;
  C.oy = 0;
  const P = project(C);
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [x, y, z] of pts) {
    const [sx, sy] = P(x, y, z);
    xs.push(sx);
    ys.push(sy);
  }
  C.ox = cx - (Math.min(...xs) + Math.max(...xs)) / 2;
  C.oy = cy - (Math.min(...ys) + Math.max(...ys)) / 2;
}

/** A rounded rectangle on the ground, sampled with outward normals. */
export function roundedRect(u0: number, v0: number, u1: number, v1: number, r: number, n = 4): Sample[] {
  r = Math.max(0, Math.min(r, (u1 - u0) / 2, (v1 - v0) / 2));
  const corners: [number, number, number][] = [
    [u1 - r, v1 - r, 0],
    [u0 + r, v1 - r, 90],
    [u0 + r, v0 + r, 180],
    [u1 - r, v0 + r, 270],
  ];
  const out: Sample[] = [];
  for (const [cu, cv, a0] of corners) {
    for (let i = 0; i <= n; i++) {
      const a = rad(a0 + (90 * i) / n);
      out.push({ u: cu + r * Math.cos(a), v: cv + r * Math.sin(a), nu: Math.cos(a), nv: Math.sin(a) });
    }
  }
  return out;
}

export function circle(cx: number, cy: number, R: number, n = 28): Sample[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return { u: cx + R * Math.cos(a), v: cy + R * Math.sin(a), nu: Math.cos(a), nv: Math.sin(a) };
  });
}

function hull(input: Vec2[]): Vec2[] {
  const pts = input.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Vec2, a: Vec2, b: Vec2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Vec2[] = [];
  const upper: Vec2[] = [];
  for (const p of pts) {
    while (lower.length > 1 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length > 1 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

export const closed = (pts: readonly Vec2[]) => "M" + pts.map((p) => `${r2(p[0])} ${r2(p[1])}`).join("L") + "Z";
export const polyline = (pts: readonly Vec2[]) =>
  pts.length < 2 ? "" : "M" + pts.map((p) => `${r2(p[0])} ${r2(p[1])}`).join("L");

/** Whether a sample's normal faces the camera. */
export const facing = (C: Camera) => {
  const s = Math.sin(C.az);
  const c = Math.cos(C.az);
  return (q: Sample) => q.nu * s + q.nv * c >= -1e-6;
};

/** The one unbroken run of samples that face the camera, in ring order. */
function frontRun(ring: readonly Sample[], keep: (q: Sample) => boolean): Sample[] {
  const n = ring.length;
  let start = -1;
  for (let i = 0; i < n; i++) {
    if (keep(ring[i]) && !keep(ring[(i + n - 1) % n])) {
      start = i;
      break;
    }
  }
  if (start < 0) return keep(ring[0]) ? ring.slice() : [];
  const out: Sample[] = [];
  for (let i = 0; i < n && keep(ring[(start + i) % n]); i++) out.push(ring[(start + i) % n]);
  return out;
}

export type Solid = { outline: string; crease: string };

/**
 * A prism standing from z0 to z1. The outline is the hull of both rings, so no
 * vertical edge is drawn; the only inner line is the front of an inset ring on
 * the lid, which reads as a bevel.
 */
export function prism(
  P: Projector,
  front: (q: Sample) => boolean,
  ring: readonly Sample[],
  inner: readonly Sample[] | null,
  z0: number,
  z1: number,
): Solid {
  const at = (z: number) => ring.map((q) => P(q.u, q.v, z));
  return {
    outline: closed(hull(at(z1).concat(at(z0)))),
    crease: inner ? polyline(frontRun(inner, front).map((q) => P(q.u, q.v, z1))) : "",
  };
}

/** A flat ring at height z, projected, as a closed path. */
export const ringPath = (P: Projector, ring: readonly Sample[], z: number) =>
  closed(ring.map((q) => P(q.u, q.v, z)));

export function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Convenience solids for the small figures. */
export function box(
  P: Projector,
  front: (q: Sample) => boolean,
  [x0, y0, x1, y1]: [number, number, number, number],
  z0: number,
  z1: number,
  r = 2,
): Solid {
  const bevel = Math.min(1.2, (x1 - x0) / 4, (y1 - y0) / 4);
  return prism(
    P,
    front,
    roundedRect(x0, y0, x1, y1, r),
    roundedRect(x0 + bevel, y0 + bevel, x1 - bevel, y1 - bevel, Math.max(0.3, r - bevel)),
    z0,
    z1,
  );
}

export function cylinder(
  P: Projector,
  front: (q: Sample) => boolean,
  cx: number,
  cy: number,
  R: number,
  z0: number,
  z1: number,
): Solid {
  return prism(P, front, circle(cx, cy, R), circle(cx, cy, R * 0.72), z0, z1);
}
