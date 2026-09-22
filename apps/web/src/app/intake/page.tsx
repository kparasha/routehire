"use client";

import { useCallback, useEffect, useState } from "react";

type Question = {
  id: string;
  prompt: string;
  optional?: boolean;
  options?: readonly string[];
};

export default function IntakePage() {
  const [step, setStep] = useState<"terms" | "questions" | "done">("terms");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [value, setValue] = useState("");
  const [optIn, setOptIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [coach, setCoach] = useState<{
    resume_text: string;
    matched_job_ids: string[];
    skill_gaps: string[];
    training: string[];
  } | null>(null);

  const startSession = useCallback(async () => {
    const res = await fetch("/api/v1/intake/sessions", { method: "POST" });
    const data = await res.json();
    setSessionId(data.session.id);
    setQuestions(data.questions);
    setStep("questions");
  }, []);

  const currentQ = questions[qIndex];

  async function submitAnswer() {
    if (!sessionId || !currentQ || submitting) return;
    setSubmitting(true);
    const answerValue = value || (currentQ.optional ? "" : value);
    const patchRes = await fetch(`/api/v1/intake/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_id: currentQ.id, value: answerValue }),
    });
    if (!patchRes.ok) {
      setSubmitting(false);
      return;
    }
    setValue("");
    if (qIndex + 1 >= questions.length) {
      const res = await fetch(`/api/v1/intake/sessions/${sessionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opt_in_talent_pool: optIn,
          accepted_terms_at: new Date().toISOString(),
        }),
      });
      setSubmitting(false);
      if (!res.ok) return;
      const data = await res.json();
      setCoach(data.coach);
      setStep("done");
    } else {
      setQIndex((i) => i + 1);
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (currentQ?.options?.length && !value) {
      setValue(currentQ.options[0]);
    }
  }, [qIndex, currentQ, value]);

  if (step === "terms") {
    return (
      <main className="container">
        <h1>Find waste industry work</h1>
        <p className="lead">No resume required — we build your profile from a short Q&amp;A (phone-friendly).</p>
        <div className="card">
          <p style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>
            By continuing you agree to RouteHire Terms: we may store your answers to match you with waste employers.
            You can use job matching without joining the talent pool by unchecking below.
          </p>
          <label className="checkbox-row">
            <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} />
            <span>
              Share my profile with hiring companies when I&apos;m a match (recommended, on by default)
            </span>
          </label>
        </div>
        <button type="button" className="btn" onClick={startSession}>
          Start questionnaire
        </button>
      </main>
    );
  }

  if (step === "done" && coach) {
    return (
      <main className="container" data-testid="intake-complete">
        <h1>You&apos;re matched</h1>
        <pre className="card" style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem" }}>
          {coach.resume_text}
        </pre>
        <p data-testid="match-count">
          {coach.matched_job_ids.length} open role(s) fit your profile.
        </p>
        {coach.skill_gaps.length > 0 && (
          <div className="card">
            <strong>Skill gaps</strong>
            <ul>
              {coach.skill_gaps.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
        )}
        <a className="btn" href="/jobs">
          View jobs
        </a>
      </main>
    );
  }

  if (!currentQ) {
    return (
      <main className="container">
        <p className="lead">Loading next step…</p>
      </main>
    );
  }

  return (
    <main className="container">
      <p style={{ color: "var(--muted)" }}>
        Question {Math.min(qIndex + 1, questions.length)} of {questions.length}
      </p>
      <h1>{currentQ.prompt}</h1>
      {currentQ?.options ? (
        <select value={value} onChange={(e) => setValue(e.target.value)}>
          {currentQ.options.map((o) => (
            <option key={o} value={o}>
              {o.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={currentQ?.optional ? "Optional" : "Your answer"}
        />
      )}
      <button
        type="button"
        className="btn"
        data-testid="intake-next"
        disabled={submitting}
        onClick={submitAnswer}
      >
        {submitting ? "Saving…" : "Next"}
      </button>
    </main>
  );
}
