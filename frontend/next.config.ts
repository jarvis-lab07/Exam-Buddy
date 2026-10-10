import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

