import { ImageResponse } from "next/og";

export const alt = "ArcLeap — Frontier AI for human possibility";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#f6f7fb",
        color: "#13192d",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          backgroundImage:
            "radial-gradient(circle at 79% 28%, rgba(91,104,223,.2), transparent 27%), radial-gradient(circle at 88% 68%, rgba(62,143,170,.12), transparent 24%), linear-gradient(rgba(80,92,130,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(80,92,130,.05) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 100% 100%, 48px 48px, 48px 48px",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 112,
          right: 82,
          display: "flex",
          width: 360,
          height: 360,
          border: "1px solid rgba(91,104,223,.28)",
          borderRadius: 999,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 170,
          right: 24,
          display: "flex",
          width: 455,
          height: 250,
          border: "1px solid rgba(62,143,170,.22)",
          borderRadius: 999,
          transform: "rotate(-18deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 258,
          right: 244,
          display: "flex",
          width: 34,
          height: 34,
          border: "8px solid white",
          borderRadius: 999,
          background: "#5b68df",
          boxShadow: "0 12px 35px rgba(91,104,223,.25)",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 76px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              display: "flex",
              width: 30,
              height: 20,
              borderRadius: 5,
              background: "linear-gradient(145deg, #8790a8, #aab3c5)",
            }}
          />
          <div style={{ fontSize: 20, letterSpacing: 4 }}>ARCLEAP</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 780 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 72,
              lineHeight: 1.02,
              letterSpacing: -3,
            }}
          >
            Building intelligence
            <span>for a world in motion.</span>
          </div>
          <div style={{ marginTop: 28, fontSize: 21, color: "#5e687d" }}>
            Frontier AI for human possibility.
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
