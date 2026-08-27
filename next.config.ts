import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Phone camera JPEGs are typically 2–8MB; default is 1MB.
      bodySizeLimit: "4.5mb",
    },
  },
};

export default nextConfig;
