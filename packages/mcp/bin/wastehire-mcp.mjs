#!/usr/bin/env node
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const entry = join(root, "src", "index.ts");
const child = spawn("npx", ["tsx", entry], {
  stdio: "inherit",
  cwd: root,
  env: process.env,
  shell: process.platform === "win32",
});
child.on("exit", (code) => process.exit(code ?? 0));
