# Demo script — 5 minutes

**Title:** WasteHire — home every night · pay only on hire  
**Live:** https://web-flame-eta-28.vercel.app  
**Claude:** connector `RouteHire` · `…/api/mcp`  
**Press:** `/press`

Camera on **supply / driver UI** (~3 min), then **demand / hauler** (~2 min).

**Tool map (same MCP, two audiences)**
- **Supply** = help drivers find seats + get coached into the pool  
- **Demand** = help haulers see talent + know the fee before they hire  

---

## Part A — Supply / drivers (~3:00)

**0:00 Hook**
- Empty routes. Drivers want home nightly.
- No resume. Chat → pool.

**0:20 Home `/`** *(supply UI ↔ `search_jobs`)*
- Prefs: CDL-B · home daily
- ZIP: `29405` or `46201`
- Live match count
- Continue

**1:00 Intake `/intake`** *(supply UI ↔ `match_profile`)*
- Name + phone (required)
- Adaptive Qs by role
- Opt-in default
- Profile submitted → “haulers call you”

**2:10 Jobs peek `/jobs`** *(supply UI ↔ `search_jobs` / `get_job` / `get_trends`)*
- Multi-geo (not just Atlanta)
- WM · Capital Waste · CurbWaste
- Bonus / urgency as signal

**Supply tools (if Claude asks driver-side)**
- `search_jobs` → seats near prefs / bonus
- `get_job` → one seat detail
- `get_trends` → where demand is hot
- `match_profile` → answers → ranked seats (coach)

**2:45 Bridge**
- “Driver side is free. Who pays? Haulers — only on hire.”

---

## Part B — Demand / haulers (~2:00)

**3:00 Hook**
- Free desk. Flat fee when they start.
- Waste-only talent, not OTR spam.

**3:20 Hiring `/hauler`** *(demand UI ↔ `list_shortlist` + `quote_hire_fee`)*
- Opted-in shortlist
- Role · CDL · ZIP
- Fee quote (flat bands)

**4:00 Claude `/hauler/mcp`**
- Name: `RouteHire` · paste remote URL

**Demand tools (hauler desk — demo these)**
- `list_shortlist` → opted-in seekers you can call
- `get_fee_schedule` → flat bands, SaaS $0, pay-on-hire
- `quote_hire_fee` → fee for a specific seat before you recruit
- *(also useful to haulers)* `search_jobs` / `get_trends` → where seats are hard to fill

**Demo prompts (demand)**
- “List shortlist near 30301”
- “Show flat placement fees”
- “Quote the fee for this CDL roll-off seat”

**Later (not built — say “roadmap”)**
- *Demand:* role paste → shortlist + fee in one call
- *Demand:* live portal scrape (not static seed)
- *Supply:* driver auth / owned identity

**4:40 Close**
- Home every night. Pay only on hire.
- Supply fills the pool; demand pays when someone starts.
