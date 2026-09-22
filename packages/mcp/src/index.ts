#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import {
  getJob,
  getTrendsTool,
  listShortlist,
  matchProfileLocal,
  quoteHireFee,
  searchJobs,
} from "./tools";

const server = new Server({ name: "wastehire", version: "0.2.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_jobs",
      description: "Search waste hauler demand (prefer schedule=home_daily)",
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
      description: "Market trends",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "match_profile",
      description: "Match intake answers to jobs",
      inputSchema: {
        type: "object",
        properties: { answers: { type: "object", additionalProperties: { type: "string" } } },
        required: ["answers"],
      },
    },
    {
      name: "list_shortlist",
      description:
        "List opted-in candidates from the live WasteHire app (set WASTEHIRE_API_URL). Includes resume_text; no phone/email.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "quote_hire_fee",
      description: "Contingent fee for a job_id",
      inputSchema: {
        type: "object",
        properties: { job_id: { type: "string" } },
        required: ["job_id"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const text = (data: unknown) => ({
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  });

  if (name === "search_jobs") return text(await searchJobs(args as Parameters<typeof searchJobs>[0]));
  if (name === "get_job") return text(await getJob((args as { id: string }).id));
  if (name === "get_trends") return text(await getTrendsTool());
  if (name === "match_profile") {
    return text(matchProfileLocal((args as { answers: Record<string, string> }).answers));
  }
  if (name === "list_shortlist") return text(await listShortlist());
  if (name === "quote_hire_fee") {
    return text(await quoteHireFee((args as { job_id: string }).job_id));
  }
  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
