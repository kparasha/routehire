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
        For owners, recruiters, dispatchers, and whoever picks up the phone. Free desk + MCP. Flat contingent fee
        when a RouteHire candidate starts — 90-day replacement.
      </p>
      <a className="btn" href="/hauler/mcp">
        MCP for recruiters &amp; dispatchers
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
            Mark hire (demo fee)
          </button>
        </div>
      ))}

      {fee != null && (
        <div className="card" data-testid="hire-fee">
          <strong>Contingent fee due: ${fee.toLocaleString()}</strong>
          <p className="meta" style={{ marginTop: "0.5rem" }}>
            90-day replacement · SaaS $0
          </p>
        </div>
      )}

      <h2 style={{ fontSize: "1rem", marginTop: "1.5rem" }}>
        Opt-in talent ({shortlist.length})
      </h2>
      {shortlist.length === 0 ? (
        <p className="meta">No opted-in drivers yet — send them to the home page ZIP form.</p>
      ) : (
        shortlist.map((c) => (
          <div key={c.session_id} className="card">
            <strong>{c.first_name || "Candidate"}</strong>
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
