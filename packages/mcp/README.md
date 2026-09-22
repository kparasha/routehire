# RouteHire MCP

Packaged stdio MCP for **hiring managers** (owners, recruiters, dispatchers, phone screeners).

## Run

```bash
npm install
npm run start --workspace=@routehire/mcp
# or globally from package:
npx routehire-mcp
```

## Cursor config

Use the live generator at **`/hauler/mcp`**, or:

```json
{
  "mcpServers": {
    "routehire": {
      "command": "npx",
      "args": ["tsx", "packages/mcp/src/index.ts"],
      "cwd": "<repo>",
      "env": { "ROUTEHIRE_API_URL": "http://127.0.0.1:3000" }
    }
  }
}
```

## Tools

| Tool | Role |
|------|------|
| `search_jobs` | Demand seats (prefer `home_daily`) |
| `get_job` / `get_trends` | Detail + market |
| `list_shortlist` | Opt-in talent (no phone/email) |
| `quote_hire_fee` | Contingent fee |
| `match_profile` | Answers → matches |

## Test

```bash
npm test --workspace=@routehire/mcp
npm run smoke --workspace=@routehire/mcp
```
