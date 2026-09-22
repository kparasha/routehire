/**
 * Demand ingest adapters — run via `npm run ingest`.
 * Live scrapes respect robots/ToS; MVP normalizes seed + optional fetch probes.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = join(__dirname, "../../data/jobs.seed.json");

const SOURCES = [
  {
    id: "wm_oracle",
    url: "https://emcm.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/WMCareers",
  },
  {
    id: "paylocity_capital_waste",
    url: "https://recruiting.paylocity.com/recruiting/jobs/All/bfafd04b-1bd4-4486-b1e3-3c3c06cd05d7/Capital-Waste-Services-LLC",
  },
  {
    id: "workable_curbwaste",
    url: "https://apply.workable.com/curbwaste/",
  },
];

function parseBonus(text) {
  const m = text.replace(/,/g, "").match(/\$\s*([\d.]+)\s*[kK]?/);
  if (!m) return null;
  let n = parseFloat(m[1]);
  if (/k/i.test(m[0])) n *= 1000;
  return Math.round(n);
}

function urgency({ bonus, days_open, role_family, hard_to_fill }) {
  let s = 20;
  if (bonus && bonus >= 1000) s += Math.min(30, Math.floor(bonus / 500));
  if (days_open > 30) s += 25;
  else if (days_open > 14) s += 15;
  if (role_family === "driver") s += 10;
  if (hard_to_fill) s += 20;
  return Math.min(100, s);
}

async function probeSource(source) {
  try {
    const res = await fetch(source.url, {
      headers: { "user-agent": "RouteHireIngest/0.1 (+https://routehire.local)" },
      signal: AbortSignal.timeout(8000),
    });
    return { id: source.id, ok: res.ok, status: res.status };
  } catch (e) {
    return { id: source.id, ok: false, error: String(e.message || e) };
  }
}

async function main() {
  const seed = JSON.parse(readFileSync(seedPath, "utf8"));
  const enriched = seed.map((job) => {
    const bonus = job.sign_on_bonus_usd ?? parseBonus(job.description_snippet || "");
    return {
      ...job,
      sign_on_bonus_usd: bonus,
      schedule: job.schedule || "home_daily",
      urgency_score:
        job.urgency_score ??
        urgency({
          bonus,
          days_open: job.days_open,
          role_family: job.role_family,
          hard_to_fill: job.hard_to_fill,
        }),
    };
  });
  writeFileSync(seedPath, JSON.stringify(enriched, null, 2) + "\n");

  const probes = await Promise.all(SOURCES.map(probeSource));
  console.log(JSON.stringify({ refreshed: enriched.length, probes, at: new Date().toISOString() }, null, 2));

  const api = process.env.ROUTEHIRE_API_URL;
  const secret = process.env.CRON_SECRET;
  if (api) {
    const res = await fetch(`${api}/api/v1/jobs/refresh`, {
      method: "POST",
      headers: secret ? { authorization: `Bearer ${secret}` } : {},
    });
    console.log("refresh", await res.json());
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
