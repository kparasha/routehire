#!/usr/bin/env bash
# WasteHire connector installer — downloads + registers with Claude Desktop / Cursor.
set -euo pipefail

HOST="${WASTEHIRE_INSTALL_HOST:-}"
if [ -z "$HOST" ]; then
  echo "Missing WASTEHIRE_INSTALL_HOST (https://your-app.vercel.app)" >&2
  exit 1
fi
HOST="${HOST%/}"
DIR="${HOME}/.wastehire-mcp"

mkdir -p "$DIR"
curl -fsSL "$HOST/connectors/wastehire-mcp/index.mjs" -o "$DIR/index.mjs"
curl -fsSL "$HOST/connectors/wastehire-mcp/package.json" -o "$DIR/package.json"
(
  cd "$DIR"
  npm install --silent
)
chmod +x "$DIR/index.mjs"

# Auto-register into known agent MCP configs (no manual JSON paste).
node <<'NODE'
const fs = require("fs");
const path = require("path");
const os = require("os");

const host = process.env.WASTEHIRE_INSTALL_HOST.replace(/\/$/, "");
const dir = path.join(os.homedir(), ".wastehire-mcp");
const entry = {
  command: "node",
  args: [path.join(dir, "index.mjs")],
  env: { WASTEHIRE_API_URL: host },
};

const targets = [];
if (process.platform === "darwin") {
  targets.push(
    path.join(os.homedir(), "Library/Application Support/Claude/claude_desktop_config.json"),
  );
}
targets.push(path.join(os.homedir(), ".cursor/mcp.json"));

for (const file of targets) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    let data = {};
    if (fs.existsSync(file)) {
      data = JSON.parse(fs.readFileSync(file, "utf8") || "{}");
    }
    data.mcpServers = data.mcpServers || {};
    data.mcpServers.routehire = entry;
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
    console.log("Registered:", file);
  } catch (e) {
    console.warn("Skipped", file, "-", e.message);
  }
}
NODE

echo ""
echo "WasteHire connector installed."
echo "Restart Claude Desktop or Cursor, then ask for shortlist candidates."
echo "Auth is not required yet (roadmap)."
