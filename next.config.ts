import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  serverExternalPackages: ['@react-three/fiber', 'drei'],
  turbopack: {
    root: 'c:/Users/Billy/Documents/projects/papar_studio',
  },
};

export default nextConfig;
