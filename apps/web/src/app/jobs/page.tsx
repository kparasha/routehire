"use client";

import { useEffect, useMemo, useState } from "react";

type Job = {
  id: string;
  title: string;
  employer_name: string;
  location: string;
  cdl_class?: string;
  schedule?: string;
  equipment?: string;
  sign_on_bonus_usd: number | null;
  pay_display?: string;
  urgency_score: number;
  trending: boolean;
  description_snippet?: string;
};

const EQUIP_LABEL: Record<string, string> = {
  roll_off: "Roll-off",
  residential: "Residential",
  front_load: "Front-load",
  commercial: "Commercial",
  shop: "Shop",
  office: "Office",
  other: "Ops",
};

/** Hiring-side demand radar — not a public apply-at-source board for drivers. */
export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [schedule, setSchedule] = useState("home_daily");
  const [cdl, setCdl] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (schedule) params.set("schedule", schedule);
    if (cdl) params.set("cdl_class", cdl);
    if (q) params.set("q", q);
    params.set("sort", "urgency");
    fetch(`/api/v1/jobs?${params}`)
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs || []));
  }, [schedule, cdl, q]);

  const countLabel = useMemo(
    () => `${jobs.length} demand seat${jobs.length === 1 ? "" : "s"} RouteHire can place into`,
    [jobs],
  );

  return (
    <main className="container">
      <p className="hero-mark">Hiring · Demand index</p>
      <h1>Open seats we place into</h1>
      <p className="lead">
        Internal demand radar for recruiters, owners, dispatchers, and phone screeners. Drivers don&apos;t apply at
        the source — RouteHire sources and places; you pull shortlists via the desk or MCP.
      </p>

      <div className="filters">
        <label className="full">
          Search city or company
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Atlanta, WM, roll-off…" />
        </label>
        <label>
          Schedule
          <select value={schedule} onChange={(e) => setSchedule(e.target.value)}>
            <option value="home_daily">Home daily</option>
            <option value="regional">Regional</option>
            <option value="otr">OTR</option>
            <option value="">Any</option>
          </select>
        </label>
        <label>
          CDL
          <select value={cdl} onChange={(e) => setCdl(e.target.value)}>
            <option value="">Any</option>
            <option value="B">Class B</option>
            <option value="A">Class A</option>
            <option value="none">No CDL</option>
          </select>
        </label>
      </div>

      <p className="meta" style={{ marginBottom: "0.75rem" }}>
        {countLabel}
      </p>

      {jobs.map((job) => (
        <article key={job.id} className="card" data-testid="job-card">
          <div>
            {job.schedule === "home_daily" && <span className="chip chip-home">Home daily</span>}
            {job.urgency_score >= 70 && <span className="chip chip-urgent">Urgent</span>}
            {job.sign_on_bonus_usd ? (
              <span className="chip chip-bonus">${job.sign_on_bonus_usd.toLocaleString()} bonus</span>
            ) : null}
            {job.cdl_class && job.cdl_class !== "none" && (
              <span className="chip chip-cdl">CDL {job.cdl_class}</span>
            )}
            {job.equipment && (
              <span className="chip chip-equip">{EQUIP_LABEL[job.equipment] || job.equipment}</span>
            )}
          </div>
          <h2>{job.title}</h2>
          <p className="meta">
            {job.employer_name} · {job.location}
          </p>
          {job.pay_display && <p className="pay">{job.pay_display}</p>}
          {job.description_snippet && (
            <p className="meta" style={{ marginTop: "0.45rem" }}>
              {job.description_snippet}
            </p>
          )}
          <a className="btn btn-secondary" href={`/hauler?job=${job.id}`}>
            Shortlist candidates for this seat
          </a>
        </article>
      ))}
    </main>
  );
}
