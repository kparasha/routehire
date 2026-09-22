#!/usr/bin/env node
/**
 * WasteHire MCP connector — remote-only.
 * Talks to a hosted WasteHire API (WASTEHIRE_API_URL).
 * Pair in Claude Desktop, Cursor, or any MCP client.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const base = () => {
  const u = process.env.WASTEHIRE_API_URL;
  if (!u) {
    console.error("Set WASTEHIRE_API_URL to your WasteHire host (e.g. https://….vercel.app)");
    process.exit(1);
  }
  return u.replace(/\/$/, "");
};

async function apiGet(path, params) {
  const url = new URL(path, base());
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v != null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(new URL(path, base()), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

async function apiPatch(path, body) {
  const res = await fetch(new URL(path, base()), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

const server = new Server({ name: "routehire", version: "0.3.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_jobs",
      description: "Search waste hauler demand seats (prefer schedule=home_daily)",
      inputSchema: {
        type: "object",
        properties: {
          q: { type: "string" },
          cdl_class: { type: "string" },
          role_family: { type: "string" },
          schedule: { type: "string" },
          bonus_min: { type: "number" },
        },
      },
    },
    {
      name: "get_job",
      description: "Get one job by id",
      inputSchema: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
    {
      name: "get_trends",
      description: "Market trends from the demand index",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "list_shortlist",
      description:
        "List opted-in candidates from the hosted talent pool (resume_text; no phone/email). Ask your agent: find CDL-B home-daily drivers near ZIP…",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "quote_hire_fee",
      description: "Contingent placement fee for a job_id",
      inputSchema: {
        type: "object",
        properties: { job_id: { type: "string" } },
        required: ["job_id"],
      },
    },
    {
      name: "match_profile",
      description: "Match a candidate answer map to open seats",
      inputSchema: {
        type: "object",
        properties: { answers: { type: "object", additionalProperties: { type: "string" } } },
        required: ["answers"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  const text = (data) => ({
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  });

  if (name === "search_jobs") {
    const params = {};
    for (const k of ["q", "cdl_class", "role_family", "schedule"]) {
      if (args[k]) params[k] = args[k];
    }
    if (args.bonus_min != null) params.bonus_min = String(args.bonus_min);
    const data = await apiGet("/api/v1/jobs", params);
    return text(data.jobs ?? data);
  }
  if (name === "get_job") {
    const data = await apiGet("/api/v1/jobs", { limit: "100" });
    const job = (data.jobs || []).find((j) => j.id === args.id) ?? null;
    return text(job);
  }
  if (name === "get_trends") return text(await apiGet("/api/v1/jobs/trends"));
  if (name === "list_shortlist") {
    const data = await apiGet("/api/v1/hauler/shortlist");
    return text(data.candidates ?? data);
  }
  if (name === "quote_hire_fee") return text(await apiPost("/api/v1/hires", { job_id: args.job_id }));
  if (name === "match_profile") {
    const answers = args.answers || {};
    const session = await apiPost("/api/v1/intake/sessions", {});
    const id = session.session.id;
    for (const [question_id, value] of Object.entries(answers)) {
      await apiPatch(`/api/v1/intake/sessions/${id}`, { question_id, value });
    }
    const done = await apiPost(`/api/v1/intake/sessions/${id}/complete`, {
      opt_in_talent_pool: false,
      accepted_terms_at: new Date().toISOString(),
    });
    return text(done.coach ?? done);
  }
  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
