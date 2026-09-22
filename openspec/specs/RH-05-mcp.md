# RH-05 MCP connector

## Capability
Stdio MCP so Cursor / hauler agents / job-provider bots can query RouteHire without scraping UIs.

## Tools
| Tool | Audience | Notes |
|------|----------|-------|
| `search_jobs` | Agents, providers | Public demand |
| `get_job` | Agents | By id |
| `get_trends` | Agents | Market signals |
| `match_profile` | Agents | Answers → matches (no PII store) |
| `list_shortlist` | Hauler agents | Opt-in talent only |
| `quote_hire_fee` | Hauler agents | Contingent fee for job_id |

## Config
```json
{ "mcpServers": { "routehire": { "command": "node", "args": ["packages/mcp/dist/index.js"] } } }
```

## Acceptance
- Vitest covers all tools
- No candidate phone/email in MCP shortlist response
