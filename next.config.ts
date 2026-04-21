import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/dev-study",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
