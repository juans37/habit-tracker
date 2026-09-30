import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Level Up",
    short_name: "Level Up",
    description: "Level up your daily habits, one week at a time",
    start_url: "/",
    display: "standalone",
    background_color: "#050607",
    theme_color: "#050607",
    orientation: "portrait",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-512-maskable",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
