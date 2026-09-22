export default function PressPage() {
  return (
    <main className="container">
      <h1>Press release</h1>
      <p className="lead">
        <strong>RouteHire launches free AI career tools for waste talent; haulers pay only on hire.</strong>
      </p>
      <div className="card">
        <h2>Problem</h2>
        <p>
          CDL and ops seats sit empty while WM-scale employers offer sign-on bonuses and niche recruiters charge
          $7.5k–$25k per placement. Independent haulers lack a modern talent layer.
        </p>
        <h2>Solution</h2>
        <p>
          RouteHire aggregates open waste jobs (bonus, urgency, trending signals), builds candidate profiles via a
          phone-first questionnaire — no resume required — and matches opt-in talent to haulers. Software is free;
          revenue is outcome-based.
        </p>
        <h2>Roadmap</h2>
        <ol>
          <li>SMS intake (same API as web) + Twilio alerts on trending roles</li>
          <li>Automated ingest across NA hauler ATS feeds (Railway workers)</li>
          <li>Mercor-style AI screen for CDL/DOT + TrashLab embed for hauler customers</li>
        </ol>
      </div>
      <h2>5-min demo script</h2>
      <ol className="lead">
        <li>Show /jobs — bonus and urgent badges from live index</li>
        <li>/intake — T&amp;C opt-in default, complete Q&amp;A without resume</li>
        <li>/hauler — mark hire → contingent fee</li>
        <li>MCP search_jobs in Cursor for agent distribution</li>
      </ol>
    </main>
  );
}
