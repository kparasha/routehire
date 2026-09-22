# Security (MVP)

## Automated checks

- `POST /api/v1/jobs/refresh` requires `Authorization: Bearer $CRON_SECRET`
- Anon RLS policies deny read on `candidates` / `intake_sessions` (see supabase migration)
- `npm audit --audit-level=high` — known Next/postcss advisories; upgrade path is Next 16 (deferred)

## Checklist (post-MVP)

- Rate limit intake endpoints
- OWASP ZAP baseline on preview
- No service role keys in client bundle
- Live Supabase for multi-instance Vercel
