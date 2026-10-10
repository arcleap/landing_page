import { ImageResponse } from "next/og";

export const alt = "ArcLeap AI — Physicality and psychology, predicted together";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "64px 72px",
        background: "#ffffff",
        color: "#0a0a0a",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1.5px solid #0a0a0a",
          paddingTop: 16,
          fontSize: 17,
          letterSpacing: 2,
        }}
      >
        <div style={{ display: "flex", gap: 28 }}>
          <span style={{ color: "#cc3a14" }}>00</span>
          <span>ARCLEAP AI</span>
        </div>
        <span style={{ color: "#6b6b6b" }}>CURRENTLY IN STEALTH</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 1060 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 80,
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: -3.5,
          }}
        >
          Physicality and psychology,
          <span style={{ color: "#e0421a" }}>predicted together.</span>
        </div>
        <div style={{ marginTop: 32, fontSize: 24, color: "#6b6b6b" }}>
          Predictive intelligence for how people respond when the physical world changes.
        </div>
      </div>
    </div>,
    size,
  );
}
