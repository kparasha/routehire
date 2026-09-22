import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: [
      "packages/**/tests/**/*.test.ts",
      "packages/**/src/**/*.test.ts",
      "apps/**/tests/**/*.test.ts",
      "evals/**/*.test.ts",
    ],
    environment: "node",
  },
  resolve: {
    alias: {
      "@wastehire/core": path.resolve(__dirname, "packages/core/src/index.ts"),
    },
  },
});
