import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function supabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

export function getSupabase() {
  if (!supabaseConfigured()) return null;
  if (!client) {
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export type ShortlistRow = {
  session_id: string;
  first_name: string | null;
  role_interest: string | null;
  cdl_class: string | null;
  zip: string | null;
  schedule_preference: string | null;
  resume_text: string | null;
};

export async function dbUpsertIntakeSession(
  id: string,
  answers: Record<string, string>,
  completed = false,
) {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.rpc("upsert_intake_session", {
    p_id: id,
    p_answers: answers,
    p_completed: completed,
  });
  if (error) throw new Error(`upsert_intake_session: ${error.message}`);
}

export async function dbGetIntakeSession(id: string) {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc("get_intake_session", { p_id: id });
  if (error) throw new Error(`get_intake_session: ${error.message}`);
  const row = Array.isArray(data) ? data[0] : data;
  return row ?? null;
}

export async function dbSaveJobSeeker(input: {
  session_id: string;
  answers: Record<string, string>;
  opt_in: boolean;
  accepted_terms_at: string;
  resume: Record<string, unknown>;
  resume_text: string;
}) {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.rpc("save_job_seeker", {
    p_session_id: input.session_id,
    p_answers: input.answers,
    p_opt_in: input.opt_in,
    p_accepted_terms_at: input.accepted_terms_at,
    p_resume: input.resume,
    p_resume_text: input.resume_text,
  });
  if (error) throw new Error(`save_job_seeker: ${error.message}`);
}

export async function dbListShortlist(): Promise<ShortlistRow[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc("list_job_seeker_shortlist");
  if (error) throw new Error(`list_job_seeker_shortlist: ${error.message}`);
  return (data ?? []) as ShortlistRow[];
}
