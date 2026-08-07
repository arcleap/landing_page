import { ImageResponse } from "next/og";

export const alt = "ArcLeap AI — Frontier AI for more people";
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
            "radial-gradient(circle at 82% 22%, rgba(91,104,223,.18), transparent 29%), radial-gradient(circle at 90% 72%, rgba(62,143,170,.12), transparent 25%), linear-gradient(rgba(80,92,130,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(80,92,130,.05) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 100% 100%, 48px 48px, 48px 48px",
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
              width: 34,
              height: 24,
              borderRadius: 5,
              background: "#050507",
            }}
          />
          <div style={{ fontSize: 20, letterSpacing: 4 }}>ARCLEAP AI</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 76,
              lineHeight: 1.02,
              letterSpacing: -3,
            }}
          >
            Bringing frontier AI
            <span>to more people.</span>
          </div>
          <div style={{ marginTop: 28, fontSize: 23, color: "#5e687d" }}>
            Independent AI company · Silicon Valley
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
