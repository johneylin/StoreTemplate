import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 18,
          background: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
          color: "#0f172a",
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: -1,
        }}
      >
        J&amp;P
      </div>
    ),
    size,
  );
}
