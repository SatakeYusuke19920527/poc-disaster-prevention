import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Azure Static Web Apps deployment.
  // The app is fully client-side; it calls Azure Functions via NEXT_PUBLIC_API_BASE_URL.
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
