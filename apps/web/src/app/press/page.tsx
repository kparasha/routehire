export default function PressPage() {
  return (
    <main className="container press">
      <p className="hero-mark">Press · internal (not in nav)</p>
      <p className="eyebrow">For immediate release</p>
      <h1>Empty routes cost money. WasteHire fills them — you only pay when someone starts.</h1>
      <p className="lead">
        Local waste jobs for drivers who want to be home every night. Ready talent for haulers who are tired of
        paying recruiters before a hire lands.
      </p>

      <section>
        <h2>The pain</h2>
        <p>
          <strong>For haulers:</strong> A vacant CDL or helper seat means missed pickups, angry customers, and
          overtime that eats the margin. Posting on giant job boards mostly attracts OTR applicants who don’t want
          residential or roll-off. Calling a specialty recruiter works — until the invoice shows up whether or not
          the seat sticks.
        </p>
        <p>
          <strong>For drivers:</strong> “Apply with resume” is a dead end on a phone. They want a local route, a real
          bonus signal, and a human who calls them back — not another freight board that ships them overnight.
        </p>
      </section>

      <section>
        <h2>What WasteHire does</h2>
        <ul>
          <li>
            <strong>Drivers chat for a few minutes</strong> — name, phone, ZIP, CDL — and land in a talent pool
            haulers can actually see. No resume upload. Opt-in by default.
          </li>
          <li>
            <strong>Haulers see who’s nearby and what’s hard to fill</strong> — local seats with sign-on urgency,
            plus a shortlist of people who already said yes to local waste work.
          </li>
          <li>
            <strong>Pay only on hire.</strong> Flat contingent fees. Free desk until someone starts. Same idea as
            outcome-based recruiting — without the black box.
          </li>
        </ul>
        <p>
          Try it:{" "}
          <a href="https://web-flame-eta-28.vercel.app">web-flame-eta-28.vercel.app</a>
        </p>
      </section>

      <section>
        <h2>Why it wins</h2>
        <ul>
          <li>Waste-only — home-daily routes, not long-haul freight noise.</li>
          <li>Drivers join for free; employers fund the network when a hire sticks.</li>
          <li>Hiring desk works in the browser or from the tools owners already use day to day.</li>
        </ul>
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
    </main>
  );
}
