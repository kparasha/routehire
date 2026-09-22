import { describe, expect, it } from "vitest";
import {
  searchJobsLocal,
  getJobLocal,
  matchProfileLocal,
  listShortlistLocal,
  quoteHireFeeLocal,
} from "../src/tools";
import { nextIntakeQuestion, isIntakeComplete } from "@wastehire/core";

describe("MCP tool wrappers (local)", () => {
  it("search_jobs filters home_daily", () => {
    const jobs = searchJobsLocal({ schedule: "home_daily", bonus_min: 1000 });
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs.every((j) => j.schedule === "home_daily")).toBe(true);
  });

  it("get_job returns one", () => {
    const job = getJobLocal("wm-2353393");
    expect(job?.title).toMatch(/CDL/i);
  });

  it("match_profile returns matched ids", () => {
    const result = matchProfileLocal({
      zip: "30301",
      cdl_class: "B",
      endorsements: "none",
      years_experience: "3",
      role_interest: "driver",
      schedule_preference: "home_daily",
      pay_band: "50_75k",
      equipment: "roll_off",
      first_name: "Alex",
      phone: "",
      email: "",
    });
    expect(result.matched_job_ids.length).toBeGreaterThan(0);
  });

  it("list_shortlist has no phone/email fields", () => {
    const list = listShortlistLocal();
    for (const c of list) {
      expect(c).not.toHaveProperty("phone");
      expect(c).not.toHaveProperty("email");
    }
  });

  it("quote_hire_fee returns fee", () => {
    const quote = quoteHireFeeLocal("capital-3535750");
    expect(quote?.contingent_fee_usd).toBeGreaterThan(0);
  });
});

describe("adaptive intake harness", () => {
  it("asks role first", () => {
    expect(nextIntakeQuestion({}).id).toBe("role_interest");
  });

  it("asks CDL after driver role + name + zip", () => {
    const q = nextIntakeQuestion({
      role_interest: "driver",
      first_name: "Sam",
      zip: "30301",
    });
    expect(q?.id).toBe("cdl_class");
  });

  it("skips CDL path for dispatch", () => {
    const q = nextIntakeQuestion({
      role_interest: "dispatch",
      first_name: "Sam",
      zip: "30301",
    });
    expect(q?.id).toBe("years_experience");
  });

  it("completes when all adaptive fields present", () => {
    expect(
      isIntakeComplete({
        role_interest: "dispatch",
        first_name: "Sam",
        zip: "10001",
        years_experience: "4",
        schedule_preference: "home_daily",
        pay_band: "50_75k",
        phone: "555",
        email: "",
      }),
    ).toBe(true);
  });
});
