import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.100.10'],
  output: 'standalone',
};

export default nextConfig;
