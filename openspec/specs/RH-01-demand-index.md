# RH-01 Demand Index

## Capability
Normalized waste/recycling job demand with bonus, urgency, trending, schedule (home_daily | regional | otr).

## API
- `GET /api/v1/jobs` — filters: q, zip, radius_mi, cdl_class, role_family, schedule, bonus_min, urgency_min, trending, sort
- `GET /api/v1/jobs/trends`
- `POST /api/v1/jobs/refresh` — Bearer CRON_SECRET

## Fields
See `JobSchema` in `@wastehire/core`. Prefer **home_daily** for residential / roll-off / local CDL seats.

## Acceptance
- Seed ≥5 jobs with at least 2 home_daily CDL roles and 1 bonus ≥ $2500
- `GET /jobs?schedule=home_daily` returns only home-daily
