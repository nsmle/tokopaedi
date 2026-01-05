import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    qualities: [1, 5, 10, 15, 25, 30, 50, 75, 100],
    minimumCacheTTL: 604800,
  },
};

export default nextConfig;
