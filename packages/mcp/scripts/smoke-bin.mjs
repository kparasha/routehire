#!/usr/bin/env node
/**
 * Smoke-test the packaged MCP entry (lists tools via a short timeout).
 * Full tool logic is covered by Vitest; this checks the bin boots.
 */
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const bin = join(dirname(fileURLToPath(import.meta.url)), "../bin/wastehire-mcp.mjs");
const child = spawn(process.execPath, [bin], {
  stdio: ["pipe", "pipe", "pipe"],
  env: { ...process.env, WASTEHIRE_API_URL: "http://127.0.0.1:3000" },
});

let stderr = "";
child.stderr.on("data", (d) => {
  stderr += d.toString();
});

const timer = setTimeout(() => {
  child.kill("SIGTERM");
  // MCP servers block on stdio — surviving ~1.5s without crash = pack OK
  if (/error|Cannot find/i.test(stderr) && !/ExperimentalWarning/i.test(stderr)) {
    console.error("MCP bin failed:", stderr);
    process.exit(1);
  }
  console.log("wastehire-mcp bin smoke: ok");
  process.exit(0);
}, 1500);

child.on("error", (e) => {
  clearTimeout(timer);
  console.error(e);
  process.exit(1);
});

child.on("exit", (code) => {
  clearTimeout(timer);
  if (code && code !== 0 && code !== null) {
    console.error("exited", code, stderr);
    process.exit(1);
  }
});
