import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  transpilePackages: ["@routehire/core"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
  devIndicators: false,
};

export default nextConfig;
