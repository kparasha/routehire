# Deploy

## Local (now)

```bash
npm install
npm run build --workspace=@wastehire/web
npm run start --workspace=@wastehire/web -- -p 3000 -H 127.0.0.1
```

Open http://127.0.0.1:3000

## MCP (see candidates you added in the browser)

1. Keep the web app running on `:3000`
2. Point the connector at the same API:

```json
{
  "mcpServers": {
    "wastehire": {
      "command": "npm",
      "args": ["run", "start", "--workspace=@wastehire/mcp"],
      "cwd": "/absolute/path/to/this/repo",
      "env": {
        "WASTEHIRE_API_URL": "http://127.0.0.1:3000"
      }
    }
  }
}
```

3. Smoke: `WASTEHIRE_API_URL=http://127.0.0.1:3000 npx tsx packages/mcp/scripts/test-shortlist.mjs`

Without `WASTEHIRE_API_URL`, MCP uses its own in-memory store (empty) — not the web talent pool.

## Vercel

Monorepo root is the Vercel project root (not `apps/web`).

```bash
npx vercel --prod
```

Install: `npm install` · Build: `npm run build --workspace=@wastehire/web` · Output: `apps/web/.next`

Do **not** use `cd ../.. && npm install` — that breaks Vercel (`idealTree already exists`).

Set nothing required for the in-memory demo. For shared talent across instances, wire Supabase (`supabase/migrations/001_wastehire.sql`).

## Railway (ingest)

Service from `worker/ingest`. Cron: `node index.js` with `WASTEHIRE_API_URL` + `CRON_SECRET`.
