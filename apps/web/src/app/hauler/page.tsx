"use client";

import { useEffect, useState } from "react";

type Job = { id: string; title: string; employer_name: string; urgency_score: number };

export default function HaulerPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [fee, setFee] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/v1/jobs?limit=5")
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs));
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
      <h1>Hauler desk</h1>
      <p className="lead">Free AI recruiting. Pay a flat contingent fee only when you hire.</p>
      {jobs.map((job) => (
        <div key={job.id} className="card">
          <strong>{job.title}</strong>
          <p style={{ margin: "0.25rem 0", color: "var(--muted)" }}>
            {job.employer_name} · urgency {job.urgency_score}
          </p>
          <button type="button" className="btn btn-secondary" disabled={loading} onClick={() => markHire(job.id)}>
            Mark hire (demo)
          </button>
        </div>
      ))}
      {fee != null && (
        <div className="card" data-testid="hire-fee">
          <strong>Contingent fee due: ${fee.toLocaleString()}</strong>
          <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem" }}>
            90-day replacement guarantee · software $0
          </p>
        </div>
      )}
    </main>
  );
}
