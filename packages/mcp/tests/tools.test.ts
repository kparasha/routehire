import { describe, expect, it } from "vitest";
import { searchJobsLocal, getJobLocal, matchProfileLocal } from "../src/tools";

describe("MCP tool wrappers (local)", () => {
  it("search_jobs returns jobs with bonus filter", () => {
    const jobs = searchJobsLocal({ bonus_min: 2500 });
    expect(jobs.length).toBeGreaterThan(0);
  });

  it("get_job returns one", () => {
    const job = getJobLocal("wm-cdl-roll-off-richmond");
    expect(job?.title).toMatch(/CDL/i);
  });

  it("match_profile returns matched ids without storing PII in tool", () => {
    const result = matchProfileLocal({
      zip: "30301",
      cdl_class: "B",
      endorsements: "none",
      years_experience: "3",
      role_interest: "driver",
      schedule_preference: "home_daily",
      pay_band: "50_75k",
    });
    expect(result.matched_job_ids.length).toBeGreaterThan(0);
    expect(result.generated_resume_json.zip).toBe("30301");
  });
});
