import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildResumeFromAnswers, coachFromResume, getJobs } from "@routehire/core";

const fixture = JSON.parse(
  readFileSync(join(__dirname, "driver-home-daily.json"), "utf-8"),
) as { answers: Record<string, string>; expect_role: string; min_matches: number };

describe("intake eval: driver-home-daily", () => {
  it("matches golden expectations", () => {
    const { generated_resume_json } = buildResumeFromAnswers(fixture.answers);
    expect(generated_resume_json.role_interest).toBe(fixture.expect_role);
    const coach = coachFromResume(generated_resume_json, getJobs());
    expect(coach.matched_job_ids.length).toBeGreaterThanOrEqual(fixture.min_matches);
  });
});
