import { NextResponse } from "next/server";
import { getTalentPoolShortlist } from "@routehire/core";

export async function GET() {
  return NextResponse.json({ candidates: getTalentPoolShortlist() });
}
