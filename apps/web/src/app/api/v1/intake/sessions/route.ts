import { NextResponse } from "next/server";
import { createIntakeSession, nextIntakeQuestion } from "@wastehire/core";
import { dbUpsertIntakeSession } from "@/lib/supabase";

export async function POST() {
  const session = createIntakeSession();
  try {
    await dbUpsertIntakeSession(session.id, session.answers, false);
  } catch (e) {
    console.error(e);
  }
  const next = nextIntakeQuestion(session.answers);
  return NextResponse.json(
    {
      session,
      next_question: next,
      agent_greeting: "I’ll build your profile for local hauler seats. First — what job do you want?",
    },
    { status: 201 },
  );
}
