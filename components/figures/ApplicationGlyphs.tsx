// Small line studies for each application. Abstract on purpose: paths and
// people as dots, never product renders.

const robotRoute = "M8 66C52 66 70 36 110 36S168 66 212 66";

function RobotsGlyph() {
  const people = [
    { x: 92, y: 74, drift: "0 0; 6 4; 0 0" },
    { x: 124, y: 86, drift: "0 0; -5 -3; 0 0" },
    { x: 150, y: 70, drift: "0 0; 4 -5; 0 0" },
  ];
  return (
    <svg className="app-glyph" viewBox="0 0 220 120" aria-hidden="true">
      <line className="ag-wall" x1={0} x2={220} y1={14} y2={14} />
      <line className="ag-wall" x1={0} x2={220} y1={106} y2={106} />
      <path className="ag-route" d={robotRoute} />
      {people.map((p) => (
        <g key={p.x}>
          <g className="ag-fan">
            <path d={`M${p.x} ${p.y}l18 -8M${p.x} ${p.y}l20 2M${p.x} ${p.y}l16 12`} />
          </g>
          <circle className="ag-person" cx={p.x} cy={p.y} r={4}>
            <animateTransform
              attributeName="transform"
              type="translate"
              values={p.drift}
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}
      <rect className="ag-robot" x={-5} y={-5} width={10} height={10}>
        <animateMotion dur="5s" repeatCount="indefinite" rotate="auto" path={robotRoute} />
      </rect>
    </svg>
  );
}

const flows = [
  "M22 60C60 60 80 30 128 28",
  "M22 60C66 60 96 46 140 44",
  "M22 60C62 62 90 76 136 84",
  "M22 60C56 64 70 96 104 100",
  "M22 60C70 58 110 60 146 60",
  "M22 60C50 56 64 22 90 22",
];

function SpacesGlyph() {
  return (
    <svg className="app-glyph" viewBox="0 0 220 120" aria-hidden="true">
      <path className="ag-wall" d="M22 50V10H206V110H22V70" />
      <rect className="ag-block" x={158} y={34} width={22} height={52} />
      <g className="ag-flows">
        {flows.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      {flows.map((d, i) => (
        <circle key={d} className="ag-mover" r={3} opacity={0}>
          <animateMotion dur={`${3 + (i % 3) * 0.7}s`} begin={`${i * 0.55}s`} repeatCount="indefinite" path={d} />
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            keyTimes="0;0.1;0.8;1"
            dur={`${3 + (i % 3) * 0.7}s`}
            begin={`${i * 0.55}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

function MediaGlyph() {
  return (
    <svg className="app-glyph" viewBox="0 0 220 120" aria-hidden="true">
      <path className="ag-wall" d="M10 22V10H22M198 10H210V22M210 98V110H198M22 110H10V98" />
      <path
        className="ag-band"
        d="M24 70C60 52 92 46 120 58S174 80 196 52V76C174 104 146 86 120 82S60 78 24 94Z"
      />
      <path className="ag-generated" d="M24 82C60 66 90 62 116 70S150 34 196 64" />
      <circle className="ag-flag" cx={144} cy={50} r={8} />
    </svg>
  );
}

export const applicationGlyphs = [RobotsGlyph, SpacesGlyph, MediaGlyph];
