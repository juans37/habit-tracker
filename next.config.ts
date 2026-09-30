import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The app used to have Spanish routes; keep old links and home-screen installs working.
  async redirects() {
    return [
      { source: "/hoy", destination: "/today", permanent: true },
      { source: "/bloques", destination: "/habits", permanent: true },
      { source: "/estadisticas", destination: "/stats", permanent: true },
    ];
  },
};

export default nextConfig;
