import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  queryJobs,
  getJobById,
  getTrends,
  getTalentPoolShortlist,
  quoteContingentFee,
  salaryMidpoint,
  WASTE_RECRUITERS_FEE_BANDS,
  buildResumeFromAnswers,
  coachFromResume,
  getJobs,
} from "@wastehire/core";
import { z } from "zod";
import { dbListShortlist, supabaseConfigured } from "./supabase";

function text(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

/** Stateless remote MCP server for Claude custom connectors / agent UIs. */
export function createWasteHireMcpServer() {
  const server = new McpServer({
    name: "WasteHire",
    version: "0.3.0",
  });

  server.registerTool(
    "search_jobs",
    {
      description: "Search waste hauler demand seats (prefer schedule=home_daily)",
      inputSchema: {
        q: z.string().optional().describe("Free-text query"),
        cdl_class: z.string().optional().describe("CDL class filter: none|A|B"),
        role_family: z.string().optional(),
        schedule: z.string().optional().describe("home_daily|regional|otr"),
        bonus_min: z.number().optional(),
      },
    },
    async (args) =>
      text(
        queryJobs({
          q: args.q,
          cdl_class: args.cdl_class,
          role_family: args.role_family,
          schedule: args.schedule,
          bonus_min: args.bonus_min,
        }),
      ),
  );

  server.registerTool(
    "get_job",
    {
      description: "Get one demand seat by id",
      inputSchema: {
        id: z.string().describe("Job id"),
      },
    },
    async ({ id }) => text(getJobById(id) ?? null),
  );

  server.registerTool(
    "get_trends",
    {
      description: "Market trends from the demand index",
      inputSchema: {},
    },
    async () => text(getTrends()),
  );

  server.registerTool(
    "list_shortlist",
    {
      description:
        "List opted-in job seekers from the WasteHire talent pool in Supabase (resume_text; no phone/email)",
      inputSchema: {},
    },
    async () => {
      if (supabaseConfigured()) {
        const rows = await dbListShortlist();
        if (rows) {
          return text(
            rows.map((r) => ({
              session_id: r.session_id,
              first_name: r.first_name,
              role_interest: r.role_interest,
              cdl_class: r.cdl_class,
              zip: r.zip,
              schedule_preference: r.schedule_preference,
              resume_text: r.resume_text,
            })),
          );
        }
      }
      return text(getTalentPoolShortlist());
    },
  );

  server.registerTool(
    "quote_hire_fee",
    {
      description:
        "Flat contingent placement fee for a job_id, using Waste Recruiters published rate bands (https://wasterecruiters.com/rates/). Not a % of salary. Due on start; 90-day replacement; $150k+ is negotiable.",
      inputSchema: {
        job_id: z.string(),
      },
    },
    async ({ job_id }) => {
      const job = getJobById(job_id);
      if (!job) return text(null);
      const mid = salaryMidpoint(job.salary_min, job.salary_max);
      const annual = mid < 100 ? mid * 2080 : mid;
      return text({
        job_id,
        annual_comp_estimate: annual,
        ...quoteContingentFee(annual),
      });
    },
  );

  server.registerTool(
    "get_fee_schedule",
    {
      description:
        "Explain WasteHire pricing if asked. Flat contingent fees mirror Waste Recruiters rates (https://wasterecruiters.com/rates/): pay only when a seeker starts; 90-day replacement; SaaS $0; $150k+ negotiable.",
      inputSchema: {},
    },
    async () =>
      text({
        model: "flat_contingent",
        source: "Waste Recruiters published rates",
        source_url: "https://wasterecruiters.com/rates/",
        saas_usd: 0,
        guarantee_days: 90,
        net_terms_days: 30,
        bands: WASTE_RECRUITERS_FEE_BANDS.map((b) => ({
          annual_pay: b.label,
          fee_usd: b.fee_usd,
          negotiable: Boolean(b.negotiable),
        })),
        notes:
          "Fees are payable by the employer, contingent on hiring a WasteHire-referred seeker. 90-day replacement guarantee.",
      }),
  );

  server.registerTool(
    "match_profile",
    {
      description: "Match a candidate answer map to open seats",
      inputSchema: {
        answers: z.record(z.string()),
      },
    },
    async ({ answers }) => {
      const { generated_resume_json } = buildResumeFromAnswers(answers);
      return text(coachFromResume(generated_resume_json, getJobs()));
    },
  );

  return server;
}
