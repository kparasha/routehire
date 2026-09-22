import { NextRequest, NextResponse } from "next/server";
import { computeContingentFee, salaryMidpoint, getJobById } from "@routehire/core";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { job_id: string; candidate_session_id?: string };
  const job = getJobById(body.job_id);
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  const mid = salaryMidpoint(job.salary_min, job.salary_max);
  const annual = mid < 100 ? mid * 2080 : mid;
  const contingent_fee_usd = computeContingentFee(annual);
  return NextResponse.json({
    hire: body,
    contingent_fee_usd,
    guarantee_days: 90 as const,
    message: "Pay only if you hire this RouteHire-sourced candidate.",
  });
}
