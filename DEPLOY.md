# Deploy

## Local (now)

```bash
npm install
npm run build --workspace=@routehire/web
npm run start --workspace=@routehire/web -- -p 3000 -H 127.0.0.1
```

Open http://127.0.0.1:3000

## MCP (see candidates you added in the browser)

1. Keep the web app running on `:3000`
2. Point the connector at the same API:

```json
{
  "mcpServers": {
    "routehire": {
      "command": "npm",
      "args": ["run", "start", "--workspace=@routehire/mcp"],
      "cwd": "/absolute/path/to/this/repo",
      "env": {
        "ROUTEHIRE_API_URL": "http://127.0.0.1:3000"
      }
    }
  }
}
```

3. Smoke: `ROUTEHIRE_API_URL=http://127.0.0.1:3000 npx tsx packages/mcp/scripts/test-shortlist.mjs`

Without `ROUTEHIRE_API_URL`, MCP uses its own in-memory store (empty) — not the web talent pool.

## Vercel

Root Directory: `apps/web` (see `apps/web/vercel.json`). Install from monorepo root.

```bash
npx vercel --cwd apps/web --prod
```

Set nothing required for the in-memory demo. For shared talent across instances, wire Supabase (`supabase/migrations/001_routehire.sql`).

## Railway (ingest)

Service from `worker/ingest`. Cron: `node index.js` with `ROUTEHIRE_API_URL` + `CRON_SECRET`.
