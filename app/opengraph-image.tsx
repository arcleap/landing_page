import { ImageResponse } from "next/og";

export const alt = "ArcLeap — From intent to verified build";
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
        background: "#071017",
        color: "#f3f5f3",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          backgroundImage:
            "linear-gradient(rgba(62,184,255,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(62,184,255,.10) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 76,
          right: 90,
          display: "flex",
          width: 320,
          height: 320,
          border: "2px solid #3eb8ff",
          transform: "rotate(8deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 142,
          right: 154,
          display: "flex",
          width: 190,
          height: 190,
          border: "1px solid rgba(62,184,255,.65)",
          borderRadius: 999,
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
              width: 12,
              height: 12,
              border: "1px solid #3eb8ff",
              transform: "rotate(45deg)",
            }}
          />
          <div style={{ fontSize: 20, letterSpacing: 4 }}>ARCLEAP</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 790 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 74,
              lineHeight: 1.02,
              letterSpacing: -3,
            }}
          >
            From intent to
            <span>verified build.</span>
          </div>
          <div style={{ marginTop: 30, fontSize: 22, color: "#aeb9bf" }}>
            The compiler between wanting and making.
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
