import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

// The preview image shown when the site is shared on WhatsApp, Facebook, LinkedIn etc.
export const alt = `${site.name}, websites and digital solutions`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(circle at 85% 30%, #26357f 0%, #07080a 55%)",
          color: "#eeece6",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: "#4f6dff" }} />
          <span>{site.name}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 92, fontWeight: 800, lineHeight: 0.95, letterSpacing: -3 }}>
          <span>WE BUILD DIGITAL</span>
          <span>EXPERIENCES THAT</span>
          <span style={{ color: "#4f6dff" }}>MOVE BUSINESSES.</span>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#8a8f99" }}>{`Websites · Online stores · Web applications · ${site.location}`}</div>
      </div>
    ),
    size,
  );
}
