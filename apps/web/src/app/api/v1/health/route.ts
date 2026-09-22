import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    last_ingest_at: process.env.LAST_INGEST_AT || new Date().toISOString(),
    service: "routehire",
  });
}
