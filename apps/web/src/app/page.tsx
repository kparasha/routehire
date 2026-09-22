"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [zip, setZip] = useState("");
  const [cdl, setCdl] = useState("B");
  const [schedule, setSchedule] = useState("home_daily");
  const [matchCount, setMatchCount] = useState<number | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("rh_prefs");
      if (saved) {
        const p = JSON.parse(saved) as { cdl?: string; schedule?: string; zip?: string };
        if (p.cdl) setCdl(p.cdl);
        if (p.schedule) setSchedule(p.schedule);
        if (p.zip) setZip(p.zip);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("rh_prefs", JSON.stringify({ cdl, schedule, zip }));
  }, [cdl, schedule, zip]);

  useEffect(() => {
    const params = new URLSearchParams({
      schedule,
      limit: "50",
    });
    if (cdl) params.set("cdl_class", cdl);
    fetch(`/api/v1/jobs?${params}`)
      .then((r) => r.json())
      .then((d) => setMatchCount((d.jobs || []).length))
      .catch(() => setMatchCount(null));
  }, [cdl, schedule]);

  function continueApply(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (zip.trim()) q.set("zip", zip.trim());
    if (cdl) q.set("cdl", cdl);
    if (schedule) q.set("schedule", schedule);
    router.push(`/intake?${q.toString()}`);
  }

  return (
    <main className="hero-board">
      <div className="hero-panel">
        <p className="hero-mark">Local waste &amp; recycling</p>
        <h1>Home every night. Seats near your ZIP.</h1>
        <p className="lead">
          Roll-off, residential, front-load — not OTR freight. One profile. When a hauler matches, they call you.
        </p>

        <div className="pref-bar" aria-label="Preferences">
          <button
            type="button"
            className={schedule === "home_daily" ? "pref on" : "pref"}
            onClick={() => setSchedule("home_daily")}
          >
            Home daily
          </button>
          <button
            type="button"
            className={cdl === "B" ? "pref on" : "pref"}
            onClick={() => setCdl("B")}
          >
            CDL-B
          </button>
          <button
            type="button"
            className={cdl === "A" ? "pref on" : "pref"}
            onClick={() => setCdl("A")}
          >
            CDL-A
          </button>
          <button
            type="button"
            className={cdl === "none" ? "pref on" : "pref"}
            onClick={() => setCdl("none")}
          >
            Training / helper
          </button>
        </div>

        {matchCount != null && (
          <p className="match-pulse" data-testid="live-match-count">
            <strong>{matchCount}</strong> open seats fit these prefs in our demand index
          </p>
        )}

        <form className="lead-form" onSubmit={continueApply}>
          <label>
            Your ZIP code
            <input
              name="zip"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="e.g. 30301"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              required
              minLength={5}
              maxLength={10}
            />
          </label>
          <button type="submit" className="btn">
            Build my driver profile
          </button>
        </form>
        <p className="fineprint">Free · ~2 minutes · No PDF resume · No spam boards</p>
        <ul className="trust-row">
          <li>Home daily first</li>
          <li>Haulers call you</li>
          <li>Pay only if they hire</li>
        </ul>
      </div>
    </main>
  );
}
