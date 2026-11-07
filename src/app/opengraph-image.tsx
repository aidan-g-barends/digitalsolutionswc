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
          background: "#f1eee7",
          color: "#141413",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: "#e8492a" }} />
          <span>{site.name}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 84, fontWeight: 700, lineHeight: 0.95, letterSpacing: -4 }}>
          <span>Websites that make your</span>
          <span>business look as good</span>
          <span style={{ color: "#e8492a" }}>as it really is.</span>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#77736b" }}>{`Websites · Online stores · Web applications · ${site.location}`}</div>
      </div>
    ),
    size,
  );
}
