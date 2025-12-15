import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure proper server configuration
  poweredByHeader: false,
  compress: true,
  // Production optimizations
  experimental: {
    optimizeCss: false,
  },
  // Ensure proper asset handling
  assetPrefix: undefined,
  // Ensure proper trailing slash handling
  trailingSlash: false,
};

export default nextConfig;
