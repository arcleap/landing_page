import { ImageResponse } from "next/og";

export const alt = "ArcLeap — Engineering agent for the physical world";
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
        background: "#f5f7fb",
        color: "#111827",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          backgroundImage:
            "radial-gradient(circle at 78% 24%, rgba(36,94,234,.12), transparent 26%), linear-gradient(rgba(36,94,234,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(36,94,234,.035) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 40px 40px, 40px 40px",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 120,
          right: 68,
          display: "flex",
          width: 420,
          height: 250,
          border: "1px solid #dbe2ea",
          borderRadius: 24,
          background: "#ffffff",
          boxShadow: "0 24px 70px rgba(31,50,81,.12)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 198,
          right: 132,
          display: "flex",
          width: 290,
          height: 94,
          border: "1px solid rgba(36,94,234,.55)",
          borderRadius: 16,
          background: "#f2f6ff",
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
              border: "1px solid #245eea",
              borderRadius: 999,
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
            Intent in.
            <span>Verified product out.</span>
          </div>
          <div style={{ marginTop: 30, fontSize: 22, color: "#536170" }}>
            The engineering agent for the physical world.
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
