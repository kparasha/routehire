import { NextResponse } from "next/server";
import { getTrends } from "@routehire/core";

export async function GET() {
  return NextResponse.json(getTrends());
}
