import { NextResponse } from "next/server";
import { createIntakeSession, nextIntakeQuestion } from "@routehire/core";

export async function POST() {
  const session = createIntakeSession();
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
