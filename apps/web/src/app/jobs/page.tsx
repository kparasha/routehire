import { queryJobs } from "@routehire/core";

export default function JobsPage() {
  const jobs = queryJobs({ sort: "urgency", limit: 30 });

  return (
    <main className="container">
      <h1>Open roles</h1>
      <p className="lead">Aggregated demand from WM, Capital Waste, CurbWaste, and recruiter feeds.</p>
      {jobs.map((job) => (
        <article key={job.id} className="card" data-testid="job-card">
          <div>
            {job.urgency_score >= 70 && <span className="chip chip-urgent">Urgent</span>}
            {job.sign_on_bonus_usd && (
              <span className="chip chip-bonus">${job.sign_on_bonus_usd.toLocaleString()} bonus</span>
            )}
            {job.trending && <span className="chip chip-trend">Trending</span>}
          </div>
          <h2 style={{ fontSize: "1.1rem", margin: "0.5rem 0 0.25rem" }}>{job.title}</h2>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
            {job.employer_name} · {job.location}
          </p>
          <a href={job.apply_url} target="_blank" rel="noreferrer" style={{ fontSize: "0.9rem" }}>
            Apply at source →
          </a>
        </article>
      ))}
    </main>
  );
}
