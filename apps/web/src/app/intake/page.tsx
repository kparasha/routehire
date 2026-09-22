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

    // Apply home-page prefs silently
    let answers = { ...data.session.answers };
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
      answers = d.session.answers;
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
          text: "Profile’s in. Expect a call when a hauler wants to talk.",
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
        <p className="hero-mark">Driver agent</p>
        <h1>Let’s build your profile</h1>
        <p className="lead">Chat through a few questions. We ask only what fits the job you want — no resume upload.</p>
        <div className="card">
          <label className="checkbox-row">
            <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} />
            <span>Share my profile with haulers when I match (on by default)</span>
          </label>
        </div>
        <button type="button" className="btn" onClick={startSession}>
          Start chat
        </button>
      </main>
    );
  }

  if (step === "done" && coach) {
    return (
      <main className="container" data-testid="intake-complete">
        <div className="success-check">✓</div>
        <h1>You&apos;re on the list</h1>
        <p className="lead">We match nearby seats. Haulers call when they want to talk.</p>
        <div className="card">
          <strong>What happens next</strong>
          <ul className="meta" style={{ lineHeight: 1.55, margin: "0.5rem 0 0", paddingLeft: "1.1rem" }}>
            <li>Local matches from your ZIP</li>
            <li>You get a call</li>
            <li>Phone agent — soon</li>
          </ul>
        </div>
        <pre className="card" style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem" }}>
          {coach.resume_text}
        </pre>
        <p data-testid="match-count" className="meta">
          {coach.matched_job_ids.length} seat(s) already look like a fit.
        </p>
      </main>
    );
  }

  return (
    <main className="container agent-shell">
      <p className="hero-mark">RouteHire agent</p>
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
              placeholder={question.optional ? "Optional — tap send to skip" : "Type your answer"}
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
    <Suspense fallback={<main className="container"><p className="lead">Loading…</p></main>}>
      <IntakeInner />
    </Suspense>
  );
}
