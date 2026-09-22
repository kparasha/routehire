import { NextRequest, NextResponse } from "next/server";
import {
  getIntakeSession,
  patchIntakeAnswer,
  nextIntakeQuestion,
  isIntakeComplete,
} from "@routehire/core";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getIntakeSession(id);
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const next = nextIntakeQuestion(session.answers);
  return NextResponse.json({
    session,
    next_question: next,
    complete: isIntakeComplete(session.answers),
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as { question_id: string; value: string };
  const session = patchIntakeAnswer(id, body.question_id, body.value ?? "");
  if (!session) return NextResponse.json({ error: "Not found or completed" }, { status: 400 });
  const next = nextIntakeQuestion(session.answers);
  return NextResponse.json({
    session,
    next_question: next,
    complete: isIntakeComplete(session.answers),
  });
}
