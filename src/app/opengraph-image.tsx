import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo";

export const alt = `${SITE_NAME} Open Graph Image`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
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
            "linear-gradient(135deg, rgb(76, 5, 25) 0%, rgb(127, 29, 29) 45%, rgb(217, 119, 6) 100%)",
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
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.06 }}>
            Vino Catalog
          </div>
          <div style={{ fontSize: 34, opacity: 0.92 }}>
            Відкрийте світ вин разом з нами
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
