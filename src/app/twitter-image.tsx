import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo";

export const alt = `${SITE_NAME} Twitter Image`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(120deg, rgb(69, 10, 10) 0%, rgb(153, 27, 27) 50%, rgb(245, 158, 11) 100%)",
          color: "white",
          padding: "56px 64px",
        }}
      >
        <div
          style={{
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: 1.2,
            opacity: 0.95,
          }}
        >
          {SITE_NAME}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.06 }}>
            Wine Community
          </div>
          <div style={{ fontSize: 32, opacity: 0.92 }}>
            Оцінюйте, зберігайте, діліться
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
