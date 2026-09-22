"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Job = { id: string; title: string; employer_name: string; urgency_score: number; location: string };
type Candidate = {
  session_id: string;
  first_name?: string;
  role_interest: string;
  cdl_class: string;
  zip: string;
};

function HaulerInner() {
  const search = useSearchParams();
  const highlight = search.get("job");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [shortlist, setShortlist] = useState<Candidate[]>([]);
  const [fee, setFee] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/v1/jobs?schedule=home_daily&limit=8")
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs || []));
    fetch("/api/v1/hauler/shortlist")
      .then((r) => r.json())
      .then((d) => setShortlist(d.candidates || []));
  }, []);

  async function markHire(jobId: string) {
    setLoading(true);
    const res = await fetch("/api/v1/hires", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: jobId }),
    });
    const data = await res.json();
    setFee(data.contingent_fee_usd);
    setLoading(false);
  }

  return (
    <main className="container">
      <p className="hero-mark">Hiring desk</p>
      <h1>Place local talent. Pay on hire.</h1>
      <p className="lead">
        Free desk + Claude connector. You only pay a <strong>flat contingent fee</strong> when a WasteHire
        seeker starts — not a % of salary, not a SaaS subscription. 90-day replacement.
      </p>

      <div className="next-card">
        <p className="next-card-title">Flat fee schedule</p>
        <p className="meta" style={{ marginBottom: "0.65rem" }}>
          Same published bands as{" "}
          <a href="https://wasterecruiters.com/rates/" target="_blank" rel="noreferrer">
            Waste Recruiters rates
          </a>
          — contingent on start, not a % of salary.
        </p>
        <ul className="why-chat">
          <li>
            <span className="tick" aria-hidden>
              ✓
            </span>
            Under $50,000 → <strong>$7,500</strong>
          </li>
          <li>
            <span className="tick" aria-hidden>
              ✓
            </span>
            $50,000 – $74,999 → <strong>$10,000</strong>
          </li>
          <li>
            <span className="tick" aria-hidden>
              ✓
            </span>
            $75,000 – $99,999 → <strong>$15,000</strong>
          </li>
          <li>
            <span className="tick" aria-hidden>
              ✓
            </span>
            $100,000 – $124,999 → <strong>$20,000</strong>
          </li>
          <li>
            <span className="tick" aria-hidden>
              ✓
            </span>
            $125,000 – $149,999 → <strong>$25,000</strong>
          </li>
          <li>
            <span className="tick" aria-hidden>
              ✓
            </span>
            $150,000+ → <strong>negotiable</strong>
          </li>
        </ul>
        <p className="meta" style={{ marginTop: "0.65rem" }}>
          Net 30 from start date · 90-day replacement · SaaS $0
        </p>
      </div>
      <a className="btn btn-cta" href="/hauler/mcp">
        Claude connector
      </a>
      <a className="btn btn-secondary" href="/jobs">
        Demand index
      </a>

      <h2 style={{ fontSize: "1rem", marginTop: "1.75rem" }}>Demand seats</h2>
      {jobs.map((job) => (
        <div
          key={job.id}
          className="card"
          style={highlight === job.id ? { borderColor: "var(--accent)" } : undefined}
        >
          <strong>{job.title}</strong>
          <p className="meta">
            {job.employer_name} · {job.location} · urgency {job.urgency_score}
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={loading}
            onClick={() => markHire(job.id)}
          >
            Quote flat fee
          </button>
        </div>
      ))}

      {fee != null && (
        <div className="card" data-testid="hire-fee">
          <strong>Flat contingent fee: ${fee.toLocaleString()}</strong>
          <p className="meta" style={{ marginTop: "0.5rem" }}>
            Due on start · 90-day replacement · SaaS $0
          </p>
        </div>
      )}

      <h2 style={{ fontSize: "1rem", marginTop: "1.5rem" }}>
        Opt-in seekers ({shortlist.length})
      </h2>
      {shortlist.length === 0 ? (
        <p className="meta">No opted-in seekers yet — send them to the home page ZIP chat.</p>
      ) : (
        shortlist.map((c) => (
          <div key={c.session_id} className="card">
            <strong>{c.first_name || "Seeker"}</strong>
            <p className="meta">
              {c.role_interest} · CDL {c.cdl_class} · ZIP {c.zip}
            </p>
          </div>
        ))
      )}
    </main>
  );
}

export default function HaulerPage() {
  return (
    <Suspense fallback={<main className="container"><p className="lead">Loading…</p></main>}>
      <HaulerInner />
    </Suspense>
  );
}
