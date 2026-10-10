import { box, camera, cylinder, depth, facing, fit, project, ringPath, roundedRect, type Solid, type Vec3 } from "@/lib/iso";

// One small scene per area: a floor, the thing that changes, and the people
// around it. On hover the thing lifts off its footprint.

const W = 400;
const H = 320;

type Rect = [number, number, number, number];
type Scene = {
  floor: Rect;
  walls?: Array<{ rect: Rect; z0: number; z1: number }>;
  object: Array<{ rect?: Rect; cyl?: [number, number, number]; z0: number; z1: number; r?: number }>;
  footprint: Rect;
  people: Array<[number, number, number]>;
  lit: number;
};

const scenes: Scene[] = [
  {
    floor: [0, 0, 100, 84],
    object: [
      { rect: [34, 24, 60, 48], z0: 0, z1: 24, r: 4 },
      { cyl: [47, 36, 7], z0: 24, z1: 34 },
      { rect: [60, 33, 84, 39], z0: 14, z1: 18, r: 1.5 },
    ],
    footprint: [34, 24, 60, 48],
    people: [
      [20, 62, 27],
      [82, 64, 30],
      [16, 18, 25],
    ],
    lit: 1,
  },
  {
    floor: [0, 0, 100, 84],
    object: [
      { rect: [36, 26, 39, 29], z0: 0, z1: 18, r: 0.8 },
      { rect: [57, 26, 60, 29], z0: 0, z1: 18, r: 0.8 },
      { rect: [36, 47, 39, 50], z0: 0, z1: 18, r: 0.8 },
      { rect: [57, 47, 60, 50], z0: 0, z1: 18, r: 0.8 },
      { rect: [34, 24, 62, 52], z0: 18, z1: 22, r: 3 },
      { rect: [34, 24, 62, 28], z0: 22, z1: 48, r: 1.5 },
    ],
    footprint: [34, 24, 62, 52],
    people: [[80, 62, 31]],
    lit: 0,
  },
  {
    floor: [0, 0, 112, 92],
    walls: [
      { rect: [0, 0, 3, 92], z0: 0, z1: 40 },
      { rect: [3, 0, 42, 3], z0: 0, z1: 40 },
      { rect: [42, 0, 60, 3], z0: 30, z1: 40 },
      { rect: [60, 0, 112, 3], z0: 0, z1: 40 },
    ],
    object: [{ rect: [64, 22, 92, 36], z0: 0, z1: 15, r: 2 }],
    footprint: [64, 22, 92, 36],
    people: [
      [30, 44, 27],
      [52, 66, 30],
      [86, 62, 28],
      [50, 22, 26],
    ],
    lit: 1,
  },
];

function draw(scene: Scene) {
  const [fx0, fy0, fx1, fy1] = scene.floor;
  const C = camera(45, 0.5, 2.2);
  const bounds: Vec3[] = [
    [fx0, fy0, -4],
    [fx1, fy1, -4],
    [fx1, fy0, -4],
    [fx0, fy1, -4],
    [fx0, fy0, 48],
  ];
  fit(C, bounds, W / 2, H / 2 + 6);
  const P = project(C);
  const front = facing(C);

  const floor = box(P, front, scene.floor, -4, 0, 8);
  const walls = (scene.walls ?? []).map((w) => box(P, front, w.rect, w.z0, w.z1, 0.8));
  const object = scene.object.map((part) =>
    part.cyl
      ? cylinder(P, front, part.cyl[0], part.cyl[1], part.cyl[2], part.z0, part.z1)
      : box(P, front, part.rect!, part.z0, part.z1, part.r),
  );
  const [ox0, oy0, ox1, oy1] = scene.footprint;
  const objectDepth = depth(C, (ox0 + ox1) / 2, (oy0 + oy1) / 2);
  const ghost = ringPath(P, roundedRect(ox0, oy0, ox1, oy1, 2), 0);

  // Walls stand at the back edges, so they paint first; everything else by depth.
  type Item = { at: number; node: "object" | number };
  const order: Item[] = [
    { at: objectDepth, node: "object" as const },
    ...scene.people.map(([x, y], i) => ({ at: depth(C, x, y), node: i })),
  ].sort((a, b) => a.at - b.at);

  const people = scene.people.map(([x, y, h]) => cylinder(P, front, x, y, 4.4, 0, h));
  return { floor, walls, object, ghost, people, order };
}

function SolidPaths({ solid, className }: { solid: Solid; className?: string }) {
  return (
    <>
      <path className={className ? `sil ${className}` : "sil"} d={solid.outline} />
      {solid.crease ? <path className="nf" d={solid.crease} /> : null}
    </>
  );
}

function Glyph({ scene }: { scene: Scene }) {
  const { floor, walls, object, ghost, people, order } = draw(scene);
  return (
    <svg className="hl glyph" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <SolidPaths solid={floor} />
      {walls.map((w, i) => (
        <SolidPaths key={`w${i}`} solid={w} />
      ))}
      {order.map((item) =>
        item.node === "object" ? (
          <g key="object">
            <path className="nf dash glyph-ghost" d={ghost} />
            <g className="glyph-object">
              {object.map((part, i) => (
                <SolidPaths key={i} solid={part} />
              ))}
            </g>
          </g>
        ) : (
          <SolidPaths
            key={`p${item.node}`}
            solid={people[item.node]}
            className={item.node === scene.lit ? "lit" : undefined}
          />
        ),
      )}
    </svg>
  );
}

export function FocusGlyph({ index }: { index: number }) {
  return <Glyph scene={scenes[index]} />;
}
