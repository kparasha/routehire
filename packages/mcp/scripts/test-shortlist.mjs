#!/usr/bin/env node
/**
 * End-to-end: create opted-in candidate via API, then list_shortlist via MCP tools (remote).
 */
import { listShortlist } from "../src/tools.ts";

const base = process.env.ROUTEHIRE_API_URL || "http://127.0.0.1:3000";

async function main() {
  process.env.ROUTEHIRE_API_URL = base;
  const session = await fetch(`${base}/api/v1/intake/sessions`, { method: "POST" }).then((r) => r.json());
  const id = session.session.id;
  const answers = {
    role_interest: "driver",
    first_name: "MCPTest",
    zip: "30301",
    cdl_class: "B",
    endorsements: "none",
    equipment: "roll_off",
    years_experience: "5",
    schedule_preference: "home_daily",
    pay_band: "50_75k",
    phone: "555-0199",
    email: "",
  };
  for (const [question_id, value] of Object.entries(answers)) {
    await fetch(`${base}/api/v1/intake/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_id, value }),
    });
  }
  await fetch(`${base}/api/v1/intake/sessions/${id}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      opt_in_talent_pool: true,
      accepted_terms_at: new Date().toISOString(),
    }),
  });

  const candidates = await listShortlist();
  const hit = candidates.find((c) => c.first_name === "MCPTest" || c.zip === "30301");
  if (!hit) {
    console.error("FAIL: shortlist missing MCPTest", candidates);
    process.exit(1);
  }
  console.log("PASS: list_shortlist sees candidate", {
    first_name: hit.first_name,
    role_interest: hit.role_interest,
    zip: hit.zip,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
