# RH-06 Demand ingest

## Sources
| source_id | Adapter |
|-----------|---------|
| wm_oracle | HTML/JSON fetch → normalize |
| paylocity_capital_waste | Paylocity public jobs |
| workable_curbwaste | Workable public |
| manual_recruiter | Seed / CSV |

## Worker
`worker/ingest` — Railway cron hits `POST /jobs/refresh` or runs adapters locally and writes seed JSON.

## Acceptance
- `npm run ingest` refreshes seed or logs adapter results
- Urgency + bonus parsed from description text
