import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0b0d",
          borderRadius: 106,
        }}
      >
        <div
          style={{
            width: 204,
            height: 204,
            borderRadius: "50%",
            background: "#ff8a3d",
          }}
        />
      </div>
    ),
    { width: 512, height: 512 }
  );
}
