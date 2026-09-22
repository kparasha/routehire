import { NextResponse } from "next/server";
import { getTrends } from "@wastehire/core";

export async function GET() {
  return NextResponse.json(getTrends());
}
