import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        borderRadius: "18px",
        background: "#e85d32",
        color: "#fffdf8",
        fontFamily: "Georgia, serif",
        fontSize: 43,
        fontWeight: 700,
        fontStyle: "italic",
        boxShadow: "inset 0 0 0 3px rgba(255,255,255,.18)",
      }}
    >
      S
      <div
        style={{
          position: "absolute",
          width: 13,
          height: 8,
          right: 8,
          top: 8,
          borderRadius: "100% 0 100% 0",
          background: "#234b38",
          transform: "rotate(-18deg)",
        }}
      />
    </div>,
    size,
  );
}
