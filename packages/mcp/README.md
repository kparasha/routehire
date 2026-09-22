# WasteHire MCP

Packaged stdio MCP for **hiring managers** (owners, recruiters, dispatchers, phone screeners).

## Run

```bash
npm install
npm run start --workspace=@wastehire/mcp
# or globally from package:
npx wastehire-mcp
```

## Cursor config

Use the live generator at **`/hauler/mcp`**, or:

```json
{
  "mcpServers": {
    "wastehire": {
      "command": "npx",
      "args": ["tsx", "packages/mcp/src/index.ts"],
      "cwd": "<repo>",
      "env": { "WASTEHIRE_API_URL": "http://127.0.0.1:3000" }
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
npm test --workspace=@wastehire/mcp
npm run smoke --workspace=@wastehire/mcp
```
