export default function PressPage() {
  return (
    <main className="container press">
      <p className="hero-mark">Press · internal (not in nav)</p>
      <p className="eyebrow">For immediate release</p>
      <h1>WasteHire places local waste talent — pay only on hire</h1>
      <p className="lead">
        Drivers get seats near home. Haulers get a free hiring desk and a Claude connector — and pay a flat
        contingent fee only when someone starts.
      </p>

      <section>
        <h2>The problem</h2>
        <p>
          Independent haulers and regional operators lose revenue when CDL and ops seats sit empty. Generic career
          sites bury “home every night” roll-off and residential roles under OTR freight noise. Niche recruiters win
          on relationships and charge contingent fees — but haulers still lack a free desk to see who’s opted in
          nearby, and drivers still face resume forms that don’t match how they actually apply (phone + chat).
        </p>
      </section>

      <section>
        <h2>The product</h2>
        <ul>
          <li>
            <strong>Drivers (supply):</strong> ZIP + CDL prefs → ~2-minute chat intake (no resume upload) → profile
            + talent-pool opt-in → matched to local demand.
          </li>
          <li>
            <strong>Haulers (demand):</strong> Live demand index (WM / Capital Waste / CurbWaste–style seats with
            bonuses &amp; urgency) → shortlist of opted-in seekers → flat contingent fee only on hire (Waste
            Recruiters–style bands) → Claude / MCP connector for the hiring desk.
          </li>
          <li>
            <strong>API → MCP → UI:</strong> Same job index and shortlist work in the browser or inside Claude as a
            custom connector.
          </li>
        </ul>
        <p>
          Live:{" "}
          <a href="https://web-flame-eta-28.vercel.app">web-flame-eta-28.vercel.app</a>
          {" · "}
          Connector name <code>WasteHire</code>
          {" · "}
          Remote MCP <code>https://web-flame-eta-28.vercel.app/api/mcp</code>
        </p>
        <p>
          Video script: repo <code>DEMO.md</code> (3 min demand / 2 min supply).
        </p>
      </section>

      <section>
        <h2>Roadmap — next 3 builds</h2>
        <ol>
          <li>
            <strong>Demand — Live demand refresh, not a static seed.</strong> Scheduled ingest over WM Oracle,
            Capital Waste Paylocity, and 1–2 other portals so bonuses, days-open, and urgency stay current. Haulers
            see what’s hard to fill this week.
          </li>
          <li>
            <strong>Demand — Role post → ranked shortlist + fee quote in one pass.</strong> Owner pastes “CDL-B
            roll-off, home daily, ZIP 43201.” Agent returns matched opted-in seekers, urgency vs. open market seats,
            and the exact flat fee band before they touch a recruiter.
          </li>
          <li>
            <strong>Supply — Auth + owned driver identity.</strong> Phone/OTP (or magic link) so the profile isn’t a
            one-shot anonymous session. Drivers can return, update CDL/ZIP, pause opt-in, and see which haulers
            viewed them — the corpus becomes a durable network.
          </li>
        </ol>
      </section>

      <section>
        <h2>UX bet</h2>
        <p>
          Uber Freight interaction (prefs + live counts) + Lanefinder hiring model (one profile, no spam). See{" "}
          <code>openspec/UX-RESEARCH.md</code>.
        </p>
      </section>
    </main>
  );
}
