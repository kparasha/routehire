"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Question = {
  id: string;
  prompt: string;
  optional?: boolean;
  options?: string[];
  agent_line?: string;
};

type Msg = { role: "agent" | "you"; text: string };

function IntakeInner() {
  const search = useSearchParams();
  const [step, setStep] = useState<"terms" | "chat" | "done">("terms");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [value, setValue] = useState("");
  const [optIn, setOptIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [coach, setCoach] = useState<{
    resume_text: string;
    matched_job_ids: string[];
    skill_gaps: string[];
  } | null>(null);

  const zipPrefill = search.get("zip") || "";
  const cdlPrefill = search.get("cdl") || "";
  const schedulePrefill = search.get("schedule") || "";

  const startSession = useCallback(async () => {
    const res = await fetch("/api/v1/intake/sessions", { method: "POST" });
    const data = await res.json();
    setSessionId(data.session.id);
    setMsgs([{ role: "agent", text: data.agent_greeting || "What job are you looking for?" }]);
    setQuestion(data.next_question);
    setStep("chat");

    const prefills: Record<string, string> = {};
    if (zipPrefill) prefills.zip = zipPrefill;
    if (cdlPrefill) prefills.cdl_class = cdlPrefill;
    if (schedulePrefill) prefills.schedule_preference = schedulePrefill;
    for (const [question_id, v] of Object.entries(prefills)) {
      const r = await fetch(`/api/v1/intake/sessions/${data.session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id, value: v }),
      });
      const d = await r.json();
      setQuestion(d.next_question);
    }
  }, [zipPrefill, cdlPrefill, schedulePrefill]);

  useEffect(() => {
    if (!question) return;
    if (question.options?.length) setValue(question.options[0]);
    else setValue("");
  }, [question?.id]);

  async function sendAnswer() {
    if (!sessionId || !question || submitting) return;
    const answerValue = value.trim();
    if (!answerValue && !question.optional) return;
    setSubmitting(true);
    const label = question.options
      ? answerValue.replace(/_/g, " ")
      : answerValue || "(skip)";
    setMsgs((m) => [...m, { role: "you", text: label }]);

    const patchRes = await fetch(`/api/v1/intake/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_id: question.id, value: answerValue }),
    });
    if (!patchRes.ok) {
      setSubmitting(false);
      return;
    }
    const patched = await patchRes.json();

    if (patched.complete) {
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
      setMsgs((m) => [
        ...m,
        {
          role: "agent",
          text: "You’re on the list. Expect a call when a hauler wants to talk.",
        },
      ]);
      setStep("done");
      return;
    }

    const next = patched.next_question as Question;
    setQuestion(next);
    setMsgs((m) => [
      ...m,
      { role: "agent", text: next.agent_line || next.prompt },
    ]);
    setSubmitting(false);
  }

  if (step === "terms") {
    return (
      <main className="container">
        <p className="hero-mark">Job seeker agent</p>
        <h1>Chat to find local seats</h1>
        <p className="lead">
          A few questions for the job you want. We match you to haulers near your ZIP — they call
          when there’s a fit. No resume upload.
        </p>
        <button type="button" className="btn btn-cta" onClick={startSession}>
          Start chat
        </button>
        <label className="opt-in-quiet">
          <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} />
          <span>Share my profile with matching haulers</span>
        </label>
      </main>
    );
  }

  if (step === "done" && coach) {
    return (
      <main className="container done-screen" data-testid="intake-complete">
        <div className="success-check success-check-lg" aria-hidden>
          ✓
        </div>
        <h1>You&apos;re on the list</h1>
        <p className="lead">We match nearby seats. Haulers call when they want to talk.</p>

        <div className="next-card">
          <p className="next-card-title">What happens next</p>
          <ul className="next-ticks">
            <li>
              <span className="tick" aria-hidden>
                ✓
              </span>
              <span>Local matches from your ZIP</span>
            </li>
            <li>
              <span className="tick" aria-hidden>
                ✓
              </span>
              <span>You get a call</span>
            </li>
            <li>
              <span className="tick tick-soon" aria-hidden>
                ○
              </span>
              <span>Phone agent — soon</span>
            </li>
          </ul>
        </div>

        <p data-testid="match-count" className="match-pulse">
          <strong>{coach.matched_job_ids.length}</strong> seat(s) already look like a fit
        </p>

        <details className="profile-details">
          <summary>Your profile</summary>
          <pre className="profile-pre">{coach.resume_text}</pre>
        </details>
      </main>
    );
  }

  return (
    <main className="container agent-shell">
      <p className="hero-mark">WasteHire agent</p>
      <div className="chat" data-testid="agent-chat">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "agent" ? "bubble agent" : "bubble you"}>
            {m.text}
          </div>
        ))}
      </div>
      {question && (
        <div className="composer">
          {question.options ? (
            <select value={value} onChange={(e) => setValue(e.target.value)}>
              {question.options.map((o) => (
                <option key={o} value={o}>
                  {o.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          ) : (
            <input
              key={question.id}
              data-testid="intake-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                question.optional
                  ? "Optional — send blank to skip"
                  : question.id === "phone"
                    ? "Mobile number"
                    : "Type your answer"
              }
              inputMode={question.id === "phone" ? "tel" : "text"}
              autoComplete={
                question.id === "phone" ? "tel" : question.id === "first_name" ? "given-name" : "off"
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") void sendAnswer();
              }}
            />
          )}
          <button
            type="button"
            className="btn"
            data-testid="intake-next"
            disabled={submitting || (!value.trim() && !question.optional)}
            onClick={sendAnswer}
          >
            {submitting ? "…" : "Send"}
          </button>
        </div>
      )}
    </main>
  );
}

export default function IntakePage() {
  return (
    <Suspense
      fallback={
        <main className="container">
          <p className="lead">Loading…</p>
        </main>
      }
    >
      <IntakeInner />
    </Suspense>
  );
}
