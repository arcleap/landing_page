import { ImageResponse } from "next/og";

export const alt = "ArcLeap — AI for the physical world";
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
        background: "#0b0b0c",
        color: "#f4f1ea",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          backgroundImage:
            "radial-gradient(circle at 76% 38%, rgba(243,184,91,.18), transparent 22%), radial-gradient(circle at 82% 56%, rgba(126,140,255,.14), transparent 28%)",
          backgroundSize: "100% 100%",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 122,
          right: 36,
          display: "flex",
          width: 470,
          height: 190,
          border: "2px solid #f3b85b",
          borderRadius: 999,
          transform: "rotate(-18deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 190,
          right: 126,
          display: "flex",
          width: 330,
          height: 150,
          border: "1px solid rgba(126,140,255,.75)",
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
              border: "1px solid #f3b85b",
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
            AI for the
            <span>physical world.</span>
          </div>
          <div style={{ marginTop: 30, fontSize: 22, color: "#9a968d" }}>
            An independent company building a family of AI-native products.
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
