# WasteHire

Local waste hiring board — **home every night** CDL & ops seats for haulers. Drivers build a profile by phone (no resume). Haulers pay only when they hire.

## Quick start

```bash
npm install
npm test
npm run build
npm run start --workspace=@wastehire/web -- -p 3000 -H 127.0.0.1
```

Open http://127.0.0.1:3000

## Surfaces

| Path | Who |
|------|-----|
| `/` `/jobs` `/intake` | Drivers — local board + match |
| `/hauler` | Haulers — shortlist + contingent fee |
| `/press` | Press + demo script |
| MCP `packages/mcp` | Agents / Cursor |

## Specs

See [openspec/GST.md](./openspec/GST.md)

## Scripts

- `npm test` / `npm run test:e2e`
- `npm run ingest` — refresh seed + probe career sites
