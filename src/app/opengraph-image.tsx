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
          background: "#07080a",
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "100px 100%",
          color: "#eeece6",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30 }}>
          <span>{site.name}</span>
          <div style={{ width: 10, height: 30, background: "#4f6dff" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 84, fontWeight: 700, lineHeight: 0.95, letterSpacing: -4 }}>
          <span>Websites that make your</span>
          <span>business look as good</span>
          <div style={{ display: "flex" }}>
            <span>as it&nbsp;</span>
            <span style={{ background: "#4f6dff", color: "#ffffff", padding: "0 8px" }}>really is</span>
            <span>.</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#8a8f99" }}>{`Websites · Online stores · Web applications · ${site.location}`}</div>
      </div>
    ),
    size,
  );
}
