import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/dev-study",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
