import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  transpilePackages: ["@wastehire/core"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
  devIndicators: false,
};

export default nextConfig;
