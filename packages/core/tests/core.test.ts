import { describe, expect, it, beforeEach } from "vitest";
import {
  parseSignOnBonus,
  computeUrgencyScore,
  computeContingentFee,
  buildResumeFromAnswers,
  matchJobs,
  getJobs,
  createIntakeSession,
  completeIntakeSession,
  getTalentPoolShortlist,
  resetStoresForTests,
  queryJobs,
  nextIntakeQuestion,
  patchIntakeAnswer,
  isIntakeComplete,
} from "../src/index";

describe("parseSignOnBonus", () => {
  it("parses dollar amounts", () => {
    expect(parseSignOnBonus("$2,500 sign-on bonus")).toBe(2500);
    expect(parseSignOnBonus("5K bonus for new hires")).toBe(5000);
  });
});

describe("computeUrgencyScore", () => {
  it("is bounded 0-100", () => {
    const s = computeUrgencyScore({
      sign_on_bonus_usd: 5000,
      days_open: 60,
      role_family: "driver",
      hard_to_fill: true,
    });
    expect(s).toBeLessThanOrEqual(100);
    expect(s).toBeGreaterThan(50);
  });
});

describe("computeContingentFee", () => {
  it("matches Waste Recruiters bands from wasterecruiters.com/rates", () => {
    expect(computeContingentFee(45_000)).toBe(7_500);
    expect(computeContingentFee(50_000)).toBe(10_000);
    expect(computeContingentFee(74_999)).toBe(10_000);
    expect(computeContingentFee(85_000)).toBe(15_000);
    expect(computeContingentFee(100_000)).toBe(20_000);
    expect(computeContingentFee(125_000)).toBe(25_000);
  });
});

describe("quoteContingentFee", () => {
  it("marks $150k+ as negotiable", async () => {
    const { quoteContingentFee } = await import("../src/fees");
    const q = quoteContingentFee(160_000);
    expect(q.negotiable).toBe(true);
    expect(q.contingent_fee_usd).toBeNull();
    expect(q.source_url).toContain("wasterecruiters.com/rates");
  });
});

describe("buildResumeFromAnswers", () => {
  it("builds stable resume_json", () => {
    const { generated_resume_json, resume_text } = buildResumeFromAnswers({
      zip: "30301",
      cdl_class: "B",
      endorsements: "air brake",
      years_experience: "3",
      role_interest: "driver",
      schedule_preference: "home_daily",
      pay_band: "50_75k",
    });
    expect(generated_resume_json.cdl_class).toBe("B");
    expect(resume_text).toContain("30301");
  });
});

describe("matchJobs", () => {
  it("returns ids for CDL driver profile", () => {
    const ids = matchJobs(
      {
        zip: "30301",
        cdl_class: "B",
        endorsements: [],
        years_experience: 2,
        role_interest: "driver",
        schedule_preference: "home_daily",
        pay_band: "50_75k",
      },
      getJobs(),
    );
    expect(ids.length).toBeGreaterThan(0);
  });
});

describe("intake talent pool opt-in", () => {
  beforeEach(() => resetStoresForTests());

  it("excludes from shortlist when opt-in false", () => {
    const s = createIntakeSession();
    s.answers = {
      zip: "30301",
      cdl_class: "B",
      endorsements: "none",
      years_experience: "2",
      role_interest: "driver",
      schedule_preference: "home_daily",
      pay_band: "50_75k",
      equipment: "roll_off",
      first_name: "A",
      phone: "",
      email: "",
    };
    completeIntakeSession(s.id, false, new Date().toISOString());
    expect(getTalentPoolShortlist()).toHaveLength(0);
  });

  it("includes when opt-in true", () => {
    const s = createIntakeSession();
    for (const [k, v] of Object.entries({
      zip: "30301",
      cdl_class: "B",
      endorsements: "none",
      years_experience: "2",
      role_interest: "driver",
      schedule_preference: "home_daily",
      pay_band: "50_75k",
      equipment: "residential",
      first_name: "Bo",
      phone: "555",
      email: "",
    })) {
      patchIntakeAnswer(s.id, k, v);
    }
    completeIntakeSession(s.id, true, new Date().toISOString());
    expect(getTalentPoolShortlist()).toHaveLength(1);
    expect(getTalentPoolShortlist()[0].resume_text).toBeTruthy();
  });
});

describe("queryJobs", () => {
  it("filters by bonus_min", () => {
    const list = queryJobs({ bonus_min: 3000 });
    expect(list.every((j) => (j.sign_on_bonus_usd ?? 0) >= 3000)).toBe(true);
  });

  it("filters home_daily schedule", () => {
    const list = queryJobs({ schedule: "home_daily" });
    expect(list.every((j) => j.schedule === "home_daily")).toBe(true);
  });
});

describe("nextIntakeQuestion harness", () => {
  it("starts with role", () => {
    expect(nextIntakeQuestion({}).id).toBe("role_interest");
  });

  it("branches driver to CDL", () => {
    expect(
      nextIntakeQuestion({ role_interest: "driver", first_name: "x", zip: "1" })?.id,
    ).toBe("cdl_class");
  });

  it("requires name and phone before complete", () => {
    expect(
      isIntakeComplete({
        role_interest: "sales",
        first_name: "",
        zip: "30301",
        years_experience: "5",
        schedule_preference: "home_daily",
        pay_band: "75_100k",
        phone: "",
        email: "",
      }),
    ).toBe(false);
    expect(
      isIntakeComplete({
        role_interest: "sales",
        first_name: "Sam",
        zip: "30301",
        years_experience: "5",
        schedule_preference: "home_daily",
        pay_band: "75_100k",
        phone: "555-0100",
        email: "",
      }),
    ).toBe(true);
  });
});
