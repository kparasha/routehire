# RouteHire build loop — PROGRESS

## 2026-03-21 (session start)

- **M1** OpenAPI + Zod core schemas — done
- **M2** Seed demand (`data/jobs.seed.json`, 7 roles WM/Capital/Curb/recruiter) — done
- **M3** Intake API + `buildResumeFromAnswers` + evals — done (13 vitest tests)
- **M4** MCP package (`search_jobs`, `get_job`, `get_trends`, `match_profile`) — done
- **M5** Playwright 3/3 — green (intake flaky once; global session store fix)
- **M6** Deploy — pending (Vercel: set root `apps/web`)

### CI gate

```
npm test     → 13 passed
npm run build --workspace=@routehire/web → OK
npm run test:e2e → 3 passed (1 flaky retry)
```

### Iteration 2

- Fixed intake global session store + submit locking
- Playwright uses `next start` (prod) — **3/3 stable**

### Next

- Push branch + Vercel deploy (root: `apps/web`)
- Wire Supabase for multi-instance persistence
