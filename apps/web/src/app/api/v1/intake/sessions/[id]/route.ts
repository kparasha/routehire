import { NextRequest, NextResponse } from "next/server";
import { getIntakeSession, patchIntakeAnswer } from "@routehire/core";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getIntakeSession(id);
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ session });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as { question_id: string; value: string };
  const session = patchIntakeAnswer(id, body.question_id, body.value);
  if (!session) return NextResponse.json({ error: "Not found or completed" }, { status: 400 });
  return NextResponse.json({ session });
}
