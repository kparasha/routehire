# RouteHire

Waste-industry hiring agent (TrashLab take-home): API-first demand index, phone-first intake (no resume required), outcome-based fees for haulers.

## Quick start

```bash
npm install
npm test
npm run dev --workspace=@routehire/web
```

Open http://localhost:3000

## Scripts

- `npm test` — Vitest (core, MCP, evals, API helpers)
- `npm run test:e2e` — Playwright smokes
- `npm run build --workspace=@routehire/web` — production build

## MCP

```bash
npm run build --workspace=@routehire/mcp
node packages/mcp/dist/index.js
```

Tools: `search_jobs`, `get_job`, `get_trends`, `match_profile`

## Deploy

- **Vercel:** root directory `apps/web`
- **Railway:** `worker/ingest` cron (optional)

## Docs

- [openapi.yaml](./openapi.yaml)
- [SECURITY.md](./SECURITY.md)
- [TESTING.md](./TESTING.md)
- [PROGRESS.md](./PROGRESS.md)
