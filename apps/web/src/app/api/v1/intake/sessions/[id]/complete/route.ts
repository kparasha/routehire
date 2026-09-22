import { NextRequest, NextResponse } from "next/server";
import {
  completeIntakeSession,
  getIntakeSession,
  hydrateIntakeSession,
  type IntakeSession,
} from "@wastehire/core";
import { dbGetIntakeSession, dbSaveJobSeeker } from "@/lib/supabase";

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

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as {
    opt_in_talent_pool: boolean;
    accepted_terms_at: string;
  };

  try {
    await loadSession(id);
  } catch (e) {
    console.error(e);
  }

  const result = completeIntakeSession(id, body.opt_in_talent_pool, body.accepted_terms_at);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await dbSaveJobSeeker({
      session_id: result.session.id,
      answers: result.session.answers,
      opt_in: body.opt_in_talent_pool,
      accepted_terms_at: body.accepted_terms_at,
      resume: result.session.generated_resume_json as unknown as Record<string, unknown>,
      resume_text: result.session.resume_text || "",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Saved locally but failed to persist to database", detail: String(e) },
      { status: 502 },
    );
  }

  return NextResponse.json(result);
}
