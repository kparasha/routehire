"use client";

import { useEffect, useState } from "react";

const FALLBACK_PROD = "https://web-flame-eta-28.vercel.app";

function resolveHost(pageOrigin: string) {
  try {
    const u = new URL(pageOrigin);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return FALLBACK_PROD;
    return pageOrigin.replace(/\/$/, "");
  } catch {
    return FALLBACK_PROD;
  }
}

export default function McpConfigPage() {
  const [pageOrigin, setPageOrigin] = useState("");
  const [copied, setCopied] = useState<"url" | "name" | null>(null);

  useEffect(() => {
    setPageOrigin(window.location.origin);
  }, []);

  const host = resolveHost(pageOrigin || FALLBACK_PROD);
  const connectorName = "WasteHire";
  const connectorUrl = `${host}/api/mcp`;

  async function copy(kind: "url" | "name", value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1600);
  }

  return (
    <main className="container">
      <p className="hero-mark">Hiring · Connector</p>
      <h1>Add WasteHire in Claude</h1>
      <p className="lead">
        Custom connector (remote MCP). Paste the name and URL in Claude → Customize → Connectors → Add
        custom connector. Auth is on the roadmap — open for demo.
      </p>

      <div className="next-card">
        <p className="next-card-title">Custom connector</p>
        <div className="connector-field">
          <span className="meta">Name</span>
          <code data-testid="mcp-name">{connectorName}</code>
          <button type="button" className="linkish" onClick={() => copy("name", connectorName)}>
            {copied === "name" ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="connector-field">
          <span className="meta">Remote MCP URL</span>
          <code data-testid="mcp-url">{connectorUrl}</code>
          <button type="button" className="linkish" onClick={() => copy("url", connectorUrl)}>
            {copied === "url" ? "Copied" : "Copy"}
          </button>
        </div>
        <button
          type="button"
          className="btn btn-cta"
          style={{ marginTop: "0.85rem" }}
          onClick={() => copy("url", connectorUrl)}
        >
          {copied === "url" ? "URL copied" : "Copy MCP URL"}
        </button>
        <p className="meta" style={{ marginTop: "0.75rem" }}>
          Claude docs:{" "}
          <a
            href="https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp"
            target="_blank"
            rel="noreferrer"
          >
            Custom connectors using remote MCP
          </a>
        </p>
      </div>

      <div className="next-card">
        <p className="next-card-title">Ask your agent</p>
        <ul className="why-chat">
          <li>
            <span className="tick" aria-hidden>
              ✓
            </span>
            “List WasteHire shortlist — home daily near 30301”
          </li>
          <li>
            <span className="tick" aria-hidden>
              ✓
            </span>
            “Find CDL-B roll-off seats with a sign-on bonus”
          </li>
          <li>
            <span className="tick" aria-hidden>
              ✓
            </span>
            “What are WasteHire’s flat placement fees?” / “Show the fee schedule”
          </li>
          <li>
            <span className="tick" aria-hidden>
              ✓
            </span>
            “Quote the flat fee for capital-waste-cdl-local”
          </li>
        </ul>
      </div>

      <details className="profile-details">
        <summary>What’s inside (optional)</summary>
        <ul className="meta" style={{ lineHeight: 1.65, margin: "0.75rem 0 0", paddingLeft: "1.1rem" }}>
          <li>
            <code>list_shortlist</code> — opted-in seekers
          </li>
          <li>
            <code>search_jobs</code> — demand seats
          </li>
          <li>
            <code>get_fee_schedule</code> / <code>quote_hire_fee</code> — Waste Recruiters flat rates
          </li>
          <li>
            <code>get_job</code> / <code>get_trends</code> / <code>match_profile</code>
          </li>
        </ul>
      </details>
      <a className="btn btn-secondary" href="/hauler" style={{ marginTop: "1rem" }}>
        Back to hiring desk
      </a>
    </main>
  );
}
