import { NextRequest, NextResponse } from "next/server";
import { completeIntakeSession } from "@routehire/core";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as {
    opt_in_talent_pool: boolean;
    accepted_terms_at: string;
  };
  const result = completeIntakeSession(id, body.opt_in_talent_pool, body.accepted_terms_at);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result);
}
