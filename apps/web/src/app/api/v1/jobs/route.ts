import { NextRequest, NextResponse } from "next/server";
import { queryJobs, JobSchema } from "@routehire/core";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const jobs = queryJobs({
    q: sp.get("q") || undefined,
    cdl_class: sp.get("cdl_class") || undefined,
    role_family: sp.get("role_family") || undefined,
    schedule: sp.get("schedule") || undefined,
    equipment: sp.get("equipment") || undefined,
    bonus_min: sp.get("bonus_min") ? Number(sp.get("bonus_min")) : undefined,
    urgency_min: sp.get("urgency_min") ? Number(sp.get("urgency_min")) : undefined,
    trending: sp.get("trending") === "true" ? true : undefined,
    sort: (sp.get("sort") as "urgency" | "bonus") || "urgency",
    limit: sp.get("limit") ? Number(sp.get("limit")) : undefined,
  });
  return NextResponse.json({ jobs: jobs.map((j) => JobSchema.parse(j)) });
}
