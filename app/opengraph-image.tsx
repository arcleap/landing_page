import { ImageResponse } from "next/og";

export const alt = "ArcLeap AI — Predict how people will respond";
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
        padding: "68px 76px",
        background: "#f2efe7",
        color: "#24231f",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 19,
          fontWeight: 600,
          letterSpacing: 4,
        }}
      >
        <div style={{ display: "flex", width: 42, height: 1, background: "#24231f" }} />
        ARCLEAP AI
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 1060 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 68,
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: -3.5,
          }}
        >
          Predict how people will respond,
          <span>before you change their world.</span>
        </div>
        <div style={{ marginTop: 32, fontSize: 23, color: "#5e5b53" }}>
          Physicality and psychology, predicted together.
        </div>
      </div>
    </div>,
    size,
  );
}
