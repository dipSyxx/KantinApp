import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from any domain (dish photos from CDN)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
