import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0f172a",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 64,
            fontWeight: 700,
            fontFamily: "sans-serif",
            letterSpacing: "-2px",
          }}
        >
          GCT
        </div>
      </div>
    ),
    { ...size },
  );
}
