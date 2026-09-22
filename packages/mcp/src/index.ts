#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { getJobLocal, getTrendsLocal, matchProfileLocal, searchJobsLocal } from "./tools.js";

const server = new Server({ name: "routehire", version: "0.1.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_jobs",
      description: "Search normalized waste industry job demand index",
      inputSchema: {
        type: "object",
        properties: {
          q: { type: "string" },
          cdl_class: { type: "string" },
          role_family: { type: "string" },
          bonus_min: { type: "number" },
          urgency_min: { type: "number" },
          trending: { type: "boolean" },
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
      description: "Trending geos, role families, avg bonus",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "match_profile",
      description: "Match intake answers to jobs (no PII storage)",
      inputSchema: {
        type: "object",
        properties: {
          answers: { type: "object", additionalProperties: { type: "string" } },
        },
        required: ["answers"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (name === "search_jobs") {
    const jobs = searchJobsLocal(args as Parameters<typeof searchJobsLocal>[0]);
    return { content: [{ type: "text", text: JSON.stringify(jobs, null, 2) }] };
  }
  if (name === "get_job") {
    const id = (args as { id: string }).id;
    const job = getJobLocal(id);
    return { content: [{ type: "text", text: JSON.stringify(job, null, 2) }] };
  }
  if (name === "get_trends") {
    return { content: [{ type: "text", text: JSON.stringify(getTrendsLocal(), null, 2) }] };
  }
  if (name === "match_profile") {
    const answers = (args as { answers: Record<string, string> }).answers;
    return { content: [{ type: "text", text: JSON.stringify(matchProfileLocal(answers), null, 2) }] };
  }
  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
