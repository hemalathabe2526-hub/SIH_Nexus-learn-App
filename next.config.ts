import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow unoptimized images for custom SVG/canvas renders
  images: {
    unoptimized: true,
  },
  // Enable static export ONLY when explicitly building for Capacitor Android APK
  ...(process.env.BUILD_TARGET === 'android' ? { output: 'export' } : {}),
};

export default nextConfig;
