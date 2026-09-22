import { queryJobs, getJobById, getTrends, buildResumeFromAnswers, coachFromResume, getJobs } from "@routehire/core";
import { apiGet } from "./rest-client.js";

export type SearchJobsArgs = {
  q?: string;
  cdl_class?: string;
  role_family?: string;
  bonus_min?: number;
  urgency_min?: number;
  trending?: boolean;
};

/** Local mode (tests, no server): use core directly. Remote: call REST. */
export function searchJobsLocal(args: SearchJobsArgs) {
  return queryJobs({
    q: args.q,
    cdl_class: args.cdl_class,
    role_family: args.role_family,
    bonus_min: args.bonus_min,
    urgency_min: args.urgency_min,
    trending: args.trending,
  });
}

export async function searchJobsRemote(args: SearchJobsArgs) {
  const params: Record<string, string> = {};
  if (args.q) params.q = args.q;
  if (args.cdl_class) params.cdl_class = args.cdl_class;
  if (args.role_family) params.role_family = args.role_family;
  if (args.bonus_min != null) params.bonus_min = String(args.bonus_min);
  if (args.urgency_min != null) params.urgency_min = String(args.urgency_min);
  if (args.trending) params.trending = "true";
  const data = (await apiGet("/api/v1/jobs", params)) as { jobs: unknown[] };
  return data.jobs;
}

export function getJobLocal(id: string) {
  return getJobById(id) ?? null;
}

export function getTrendsLocal() {
  return getTrends();
}

export function matchProfileLocal(answers: Record<string, string>) {
  const { generated_resume_json } = buildResumeFromAnswers(answers);
  return coachFromResume(generated_resume_json, getJobs());
}
