# Security (MVP)

## Automated checks

- Supabase RLS documented for production; MVP uses in-memory talent pool with server-only shortlist API
- `POST /api/v1/jobs/refresh` requires `Authorization: Bearer $CRON_SECRET`
- `npm audit` in CI (moderate+ review)

## Checklist (post-MVP)

- Rate limit `POST /intake/sessions` and candidate endpoints
- OWASP ZAP baseline on preview deploy
- No service role keys in client bundle
- PII consent via T&C + opt-in default with explicit uncheck
