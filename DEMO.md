# Demo script — 5 minutes (private — not in product nav)

**Title / thumbnail:** WasteHire — local waste seats for drivers; flat pay-on-hire for haulers.

**Live:** https://web-flame-eta-28.vercel.app · Claude connector name `WasteHire` · MCP `https://web-flame-eta-28.vercel.app/api/mcp`

Speak to **hauler ops / owner** for minutes 0–3, then **driver** for 3–5. Same tab; switch personas cleanly.

In-browser one-pager (press + roadmap): `/press`

---

## Part A — Demand / haulers (~3:00)

| Time | Beat | What to show / say |
|------|------|--------------------|
| **0:00–0:25** | Hook | “Empty CDL seats cost routes. WasteHire is free until you hire — flat fee, waste-only.” |
| **0:25–0:55** | Problem | Contrast generic job boards vs. local home-daily waste seats; mention bonuses ($2.5k–$7.5k) as urgency signal. |
| **0:55–1:40** | Demand index | Open `/jobs` (or home prefs). Filter CDL-B + home daily. Call out multi-geo seed (not just Atlanta): SC/TN/OH/IN, WM + Capital Waste + CurbWaste. Point at bonus + urgency. |
| **1:40–2:20** | Hiring desk | `/hauler` — shortlist of opted-in seekers (name/role/ZIP). Show contingent fee quote for a sample salary band. |
| **2:20–2:55** | MCP / Claude | `/hauler/mcp` — connector name **WasteHire** + remote URL. Prompt: “List shortlist near 30301” / “Show flat placement fees.” “Same API your agent already uses.” |
| **2:55–3:00** | Bridge | “That’s demand. Drivers get in for free — next two minutes.” |

## Part B — Supply / drivers (~2:00)

| Time | Beat | What to show / say |
|------|------|--------------------|
| **3:00–3:25** | Hook | “No resume. Chat like texting a recruiter. Opt into the pool by default.” |
| **3:25–3:55** | Prefs → intake | Home: ZIP (e.g. **29405** North Charleston or **46201** Indy), CDL B, home daily → live match count → Continue. |
| **3:55–4:35** | Agentic intake | `/intake` — name + phone required; adaptive questions by role. Finish → profile / what’s next (pool + haulers reach out). |
| **4:35–4:50** | Flywheel | “Every opt-in grows supply. Haulers pay only when that person starts.” |
| **4:50–5:00** | Close | *Home every night. Pay only on hire.* CTA: try the board / add WasteHire in Claude. Next: live scrape, role→shortlist agent, driver auth. |

## UX research takeaway

Best freight UX: **Uber Freight**. Best CDL *job* UX: **Lanefinder/LMDR**. See `openspec/UX-RESEARCH.md`.
