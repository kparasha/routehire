# WasteHire GST (Goal–Spec–Test)

## Goal
Ship a working local waste hiring board: drivers find **home-daily** hauler jobs near ZIP without a resume; haulers get shortlists and pay only on hire; agents query demand via MCP.

## Spec packages
| ID | Package | Status |
|----|---------|--------|
| RH-01 | Demand index API | Implemented (seed) |
| RH-02 | Phone-first intake | Implemented |
| RH-03 | Driver board UI (local / home daily) | In progress |
| RH-04 | Hauler desk + contingent fee | Implemented |
| RH-05 | MCP connector (jobs + hauler tools) | Expand |
| RH-06 | Demand ingest adapters | Stub → expand |
| RH-07 | Persistence (Supabase) | Schema ready |

## Tests (gates)
- `npm test` — unit + evals + MCP + cron auth
- `npm run test:e2e` — jobs badges, intake, hire fee
- Prod smoke: `GET /api/v1/health`

## Non-goals (post-MVP)
- Full OWASP pentest, SMS Twilio live, LinkedIn scrape, video AI interview
