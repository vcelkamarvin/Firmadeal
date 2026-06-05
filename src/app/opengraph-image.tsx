import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Firmadeal — Unternehmen verkaufen ohne Makler";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1a3329",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: "white",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "#1a3329",
            }}
          >
            F
          </div>
          <span style={{ color: "white", fontSize: 40, fontWeight: 700, letterSpacing: "-1px" }}>
            Firmadeal.de
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            color: "white",
            fontSize: 52,
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.15,
            marginBottom: 24,
            letterSpacing: "-1px",
          }}
        >
          Unternehmen verkaufen ohne Makler
        </div>

        {/* Sub */}
        <div
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: 26,
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          DACH-Marktplatz für Unternehmensverkäufe
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: 16 }}>
          {["0% Provision", "Anonym", "7 Tage kostenlos"].map((label) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 999,
                padding: "10px 24px",
                color: "white",
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
