"use client";

import { useEffect, useMemo, useState } from "react";

type ToolName =
  | "search_jobs"
  | "get_trends"
  | "list_shortlist"
  | "quote_hire_fee"
  | "match_profile";

export default function McpConfigPage() {
  const [origin, setOrigin] = useState("http://127.0.0.1:3000");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const config = useMemo(
    () =>
      JSON.stringify(
        {
          mcpServers: {
            routehire: {
              command: "npx",
              args: ["tsx", "packages/mcp/src/index.ts"],
              cwd: "<path-to-routehire-repo>",
              env: {
                ROUTEHIRE_API_URL: origin,
              },
            },
          },
        },
        null,
        2,
      ),
    [origin],
  );

  async function runTool(name: ToolName) {
    setBusy(true);
    try {
      if (name === "search_jobs") {
        const res = await fetch(`${origin}/api/v1/jobs?schedule=home_daily&limit=3`);
        setResult(JSON.stringify(await res.json(), null, 2));
      } else if (name === "get_trends") {
        const res = await fetch(`${origin}/api/v1/jobs/trends`);
        setResult(JSON.stringify(await res.json(), null, 2));
      } else if (name === "list_shortlist") {
        const res = await fetch(`${origin}/api/v1/hauler/shortlist`);
        setResult(JSON.stringify(await res.json(), null, 2));
      } else if (name === "quote_hire_fee") {
        const res = await fetch(`${origin}/api/v1/hires`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_id: "capital-waste-cdl-local" }),
        });
        setResult(JSON.stringify(await res.json(), null, 2));
      } else if (name === "match_profile") {
        const session = await fetch(`${origin}/api/v1/intake/sessions`, { method: "POST" }).then((r) =>
          r.json(),
        );
        const id = session.session.id as string;
        const answers: Record<string, string> = {
          zip: "30301",
          cdl_class: "B",
          endorsements: "none",
          years_experience: "3",
          role_interest: "driver",
          schedule_preference: "home_daily",
          pay_band: "50_75k",
        };
        for (const [question_id, value] of Object.entries(answers)) {
          await fetch(`${origin}/api/v1/intake/sessions/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question_id, value }),
          });
        }
        const done = await fetch(`${origin}/api/v1/intake/sessions/${id}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            opt_in_talent_pool: true,
            accepted_terms_at: new Date().toISOString(),
          }),
        }).then((r) => r.json());
        setResult(JSON.stringify(done.coach, null, 2));
      }
    } catch (e) {
      setResult(String(e));
    }
    setBusy(false);
  }

  return (
    <main className="container wide">
      <p className="hero-mark">Hiring managers · MCP</p>
      <h1>RouteHire connector</h1>
      <p className="lead">
        For owners, recruiters, dispatchers, and phone-line staff using Cursor or any MCP client. Query open seats,
        shortlists, and contingent fees without leaving your agent.
      </p>

      <div className="card">
        <strong>Install</strong>
        <p className="meta" style={{ margin: "0.4rem 0 0.75rem" }}>
          From the RouteHire repo: <code>npm install && npm run start --workspace=@routehire/mcp</code>
        </p>
        <p className="meta">Paste into Cursor MCP settings:</p>
        <pre className="code-block" data-testid="mcp-config">
          {config}
        </pre>
        <p className="meta" style={{ marginTop: "0.75rem" }}>
          <strong>Important:</strong> set <code>ROUTEHIRE_API_URL</code> to this app so{" "}
          <code>list_shortlist</code> returns candidates you added in the browser (same process as the hiring desk).
        </p>
      </div>

      <div className="card">
        <strong>Live tool smoke (REST behind MCP)</strong>
        <p className="meta">Same payloads the MCP tools return — safe to click on this demo.</p>
        <div className="tool-row">
          <button type="button" disabled={busy} onClick={() => runTool("search_jobs")}>
            search_jobs
          </button>
          <button type="button" disabled={busy} onClick={() => runTool("get_trends")}>
            get_trends
          </button>
          <button type="button" disabled={busy} onClick={() => runTool("list_shortlist")}>
            list_shortlist
          </button>
          <button type="button" disabled={busy} onClick={() => runTool("quote_hire_fee")}>
            quote_hire_fee
          </button>
          <button type="button" disabled={busy} onClick={() => runTool("match_profile")}>
            match_profile
          </button>
        </div>
        {result && (
          <pre className="code-block" data-testid="mcp-result">
            {result}
          </pre>
        )}
      </div>

      <div className="card">
        <strong>Tools</strong>
        <ul className="meta" style={{ lineHeight: 1.6 }}>
          <li>
            <code>search_jobs</code> — demand index (home_daily preferred)
          </li>
          <li>
            <code>get_job</code> / <code>get_trends</code>
          </li>
          <li>
            <code>list_shortlist</code> — opt-in talent only (no phone/email)
          </li>
          <li>
            <code>quote_hire_fee</code> — contingent fee for a seat
          </li>
          <li>
            <code>match_profile</code> — answers → matches
          </li>
        </ul>
      </div>

      <a className="btn btn-secondary" href="/hauler">
        Back to hiring desk
      </a>
      <a className="btn btn-secondary" href="/jobs">
        View demand index
      </a>
    </main>
  );
}
