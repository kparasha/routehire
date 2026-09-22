import { NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/auth";

export async function POST(request: Request) {
  if (!requireCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    message: "Ingest triggered (Railway worker loads seed + adapters)",
    at: new Date().toISOString(),
  });
}
