import {
  queryJobs,
  getJobById,
  getTrends,
  buildResumeFromAnswers,
  coachFromResume,
  getJobs,
  getTalentPoolShortlist,
  computeContingentFee,
  salaryMidpoint,
} from "@wastehire/core";
import { apiGet, apiPost } from "./rest-client";

const useRemote = () => Boolean(process.env.WASTEHIRE_API_URL);

export type SearchJobsArgs = {
  q?: string;
  cdl_class?: string;
  role_family?: string;
  schedule?: string;
  bonus_min?: number;
  urgency_min?: number;
  trending?: boolean;
};

export function searchJobsLocal(args: SearchJobsArgs) {
  return queryJobs({
    q: args.q,
    cdl_class: args.cdl_class,
    role_family: args.role_family,
    schedule: args.schedule,
    bonus_min: args.bonus_min,
    urgency_min: args.urgency_min,
    trending: args.trending,
  });
}

export async function searchJobs(args: SearchJobsArgs) {
  if (!useRemote()) return searchJobsLocal(args);
  const params: Record<string, string> = {};
  if (args.q) params.q = args.q;
  if (args.cdl_class) params.cdl_class = args.cdl_class;
  if (args.role_family) params.role_family = args.role_family;
  if (args.schedule) params.schedule = args.schedule;
  if (args.bonus_min != null) params.bonus_min = String(args.bonus_min);
  if (args.urgency_min != null) params.urgency_min = String(args.urgency_min);
  if (args.trending) params.trending = "true";
  const data = (await apiGet("/api/v1/jobs", params)) as { jobs: unknown[] };
  return data.jobs;
}

export function getJobLocal(id: string) {
  return getJobById(id) ?? null;
}

export async function getJob(id: string) {
  if (!useRemote()) return getJobLocal(id);
  const jobs = (await apiGet("/api/v1/jobs", { limit: "100" })) as { jobs: { id: string }[] };
  return jobs.jobs.find((j) => j.id === id) ?? null;
}

export function getTrendsLocal() {
  return getTrends();
}

export async function getTrendsTool() {
  if (!useRemote()) return getTrendsLocal();
  return apiGet("/api/v1/jobs/trends");
}

export function matchProfileLocal(answers: Record<string, string>) {
  const { generated_resume_json } = buildResumeFromAnswers(answers);
  return coachFromResume(generated_resume_json, getJobs());
}

export function listShortlistLocal() {
  return getTalentPoolShortlist().map((c) => ({
    session_id: c.session_id,
    first_name: c.first_name,
    role_interest: c.role_interest,
    cdl_class: c.cdl_class,
    zip: c.zip,
    resume_text: c.resume_text,
  }));
}

/** Prefer live API so MCP sees candidates from the running web app */
export async function listShortlist() {
  if (!useRemote()) return listShortlistLocal();
  const data = (await apiGet("/api/v1/hauler/shortlist")) as {
    candidates: Array<{
      session_id: string;
      first_name?: string;
      role_interest: string;
      cdl_class: string;
      zip: string;
      resume_text?: string;
    }>;
  };
  return data.candidates;
}

export function quoteHireFeeLocal(job_id: string) {
  const job = getJobById(job_id);
  if (!job) return null;
  const mid = salaryMidpoint(job.salary_min, job.salary_max);
  const annual = mid < 100 ? mid * 2080 : mid;
  return {
    job_id,
    contingent_fee_usd: computeContingentFee(annual),
    guarantee_days: 90 as const,
  };
}

export async function quoteHireFee(job_id: string) {
  if (!useRemote()) return quoteHireFeeLocal(job_id);
  return apiPost("/api/v1/hires", { job_id });
}
