import { NextResponse } from "next/server";
import { createIntakeSession, INTAKE_QUESTIONS } from "@routehire/core";

export async function POST() {
  const session = createIntakeSession();
  return NextResponse.json({ session, questions: INTAKE_QUESTIONS }, { status: 201 });
}
