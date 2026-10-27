import { ImageResponse } from "next/og";

export const alt = "ArcLeap AI — The human layer of any world";
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
        color: "#1a1f1d",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1.5px solid #1a1f1d",
          paddingTop: 16,
          fontSize: 17,
          letterSpacing: 2,
        }}
      >
        <div style={{ display: "flex", gap: 28 }}>
          <span style={{ color: "#0b4430" }}>00</span>
          <span>ARCLEAP AI</span>
        </div>
        <span style={{ color: "#69716d" }}>CURRENTLY IN STEALTH</span>
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
          The human layer
          <span style={{ color: "#0b4430" }}>of any world.</span>
        </div>
        <div style={{ marginTop: 32, fontSize: 24, color: "#69716d" }}>
          One model that predicts how people respond, physically and psychologically, when their world changes.
        </div>
      </div>
    </div>,
    size,
  );
}
