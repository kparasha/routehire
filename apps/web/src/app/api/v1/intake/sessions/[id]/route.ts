import { NextRequest, NextResponse } from "next/server";
import {
  getIntakeSession,
  patchIntakeAnswer,
  nextIntakeQuestion,
  isIntakeComplete,
  hydrateIntakeSession,
  type IntakeSession,
} from "@wastehire/core";
import { dbGetIntakeSession, dbUpsertIntakeSession } from "@/lib/supabase";

async function loadSession(id: string): Promise<IntakeSession | null> {
  const mem = getIntakeSession(id);
  if (mem) return mem;

  const row = await dbGetIntakeSession(id);
  if (!row) return null;

  return hydrateIntakeSession({
    id: row.id,
    answers: (row.answers ?? {}) as Record<string, string>,
    completed: Boolean(row.completed),
    opt_in_talent_pool: Boolean(row.opt_in_talent_pool),
    accepted_terms_at: row.accepted_terms_at ?? null,
    generated_resume_json: row.generated_resume_json ?? null,
    resume_text: row.resume_text ?? null,
    created_at: row.created_at ?? new Date().toISOString(),
  });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let session: IntakeSession | null = null;
  try {
    session = await loadSession(id);
  } catch (e) {
    console.error(e);
    session = getIntakeSession(id) ?? null;
  }
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

  try {
    await loadSession(id);
  } catch (e) {
    console.error(e);
  }

  const session = patchIntakeAnswer(id, body.question_id, body.value ?? "");
  if (!session) return NextResponse.json({ error: "Not found or completed" }, { status: 400 });

  try {
    await dbUpsertIntakeSession(session.id, session.answers, session.completed);
  } catch (e) {
    console.error(e);
  }

  const next = nextIntakeQuestion(session.answers);
  return NextResponse.json({
    session,
    next_question: next,
    complete: isIntakeComplete(session.answers),
  });
}
