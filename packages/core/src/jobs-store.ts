import type { GeneratedResume, Job, RoleFamily } from "./schemas";
import { buildResumeFromAnswers, coachFromResume } from "./intake";
import { computeUrgencyScore } from "./urgency";
import { parseSignOnBonus } from "./parsers";
import seedJobs from "../../../data/jobs.seed.json";

let jobsCache: Job[] | null = null;

export function normalizeSeedJob(raw: (typeof seedJobs)[number]): Job {
  const bonus =
    raw.sign_on_bonus_usd ??
    parseSignOnBonus(raw.description_snippet || raw.title || "");
  const urgency_score =
    raw.urgency_score ??
    computeUrgencyScore({
      sign_on_bonus_usd: bonus,
      days_open: raw.days_open,
      role_family: raw.role_family as RoleFamily,
      hard_to_fill: raw.hard_to_fill,
    });
  const text = `${raw.title} ${raw.description_snippet || ""}`.toLowerCase();
  const schedule =
    (raw as { schedule?: string }).schedule ||
    (/otr|over.?the.?road/.test(text)
      ? "otr"
      : /regional/.test(text)
        ? "regional"
        : "home_daily");
  const equipment =
    (raw as { equipment?: string }).equipment ||
    (/roll.?off/.test(text)
      ? "roll_off"
      : /residential/.test(text)
        ? "residential"
        : /front.?load/.test(text)
          ? "front_load"
          : /mechanic|shop|diesel/.test(text)
            ? "shop"
            : /dispatch|pm|product/.test(text)
              ? "office"
              : "other");
  return {
    ...raw,
    schedule,
    equipment,
    sign_on_bonus_usd: bonus,
    urgency_score,
  } as Job;
}

export function getJobs(): Job[] {
  if (!jobsCache) {
    jobsCache = seedJobs.map(normalizeSeedJob);
  }
  return jobsCache;
}

export function getJobById(id: string): Job | undefined {
  return getJobs().find((j) => j.id === id);
}

export type JobQuery = {
  q?: string;
  cdl_class?: string;
  role_family?: string;
  schedule?: string;
  equipment?: string;
  bonus_min?: number;
  urgency_min?: number;
  trending?: boolean;
  sort?: "urgency" | "posted_at" | "bonus";
  limit?: number;
};

export function queryJobs(query: JobQuery): Job[] {
  let list = [...getJobs()];
  if (query.q) {
    const q = query.q.toLowerCase();
    list = list.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.employer_name.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q),
    );
  }
  if (query.cdl_class) list = list.filter((j) => j.cdl_class === query.cdl_class);
  if (query.role_family) list = list.filter((j) => j.role_family === query.role_family);
  if (query.schedule) list = list.filter((j) => j.schedule === query.schedule);
  if (query.equipment) list = list.filter((j) => j.equipment === query.equipment);
  if (query.bonus_min != null) {
    list = list.filter((j) => (j.sign_on_bonus_usd ?? 0) >= query.bonus_min!);
  }
  if (query.urgency_min != null) {
    list = list.filter((j) => j.urgency_score >= query.urgency_min!);
  }
  if (query.trending === true) list = list.filter((j) => j.trending);
  const sort = query.sort || "urgency";
  list.sort((a, b) => {
    if (sort === "bonus") return (b.sign_on_bonus_usd ?? 0) - (a.sign_on_bonus_usd ?? 0);
    if (sort === "urgency") return b.urgency_score - a.urgency_score;
    return 0;
  });
  const limit = query.limit ?? 50;
  return list.slice(0, limit);
}

export function getTrends() {
  const jobs = getJobs();
  const byGeo: Record<string, number> = {};
  const byRole: Record<string, number> = {};
  let bonusSum = 0;
  let bonusCount = 0;
  for (const j of jobs) {
    const geo = j.location.split(",").pop()?.trim() || j.location;
    byGeo[geo] = (byGeo[geo] || 0) + 1;
    byRole[j.role_family] = (byRole[j.role_family] || 0) + 1;
    if (j.sign_on_bonus_usd) {
      bonusSum += j.sign_on_bonus_usd;
      bonusCount++;
    }
  }
  return {
    top_geos: Object.entries(byGeo)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([geo, count]) => ({ geo, count })),
    top_role_families: Object.entries(byRole)
      .sort((a, b) => b[1] - a[1])
      .map(([role_family, count]) => ({ role_family, count })),
    avg_sign_on_bonus_usd: bonusCount ? Math.round(bonusSum / bonusCount) : null,
    total_open_roles: jobs.length,
  };
}

/** In-memory intake + talent pool for MVP (Supabase-ready shape). */
export type IntakeSession = {
  id: string;
  answers: Record<string, string>;
  completed: boolean;
  opt_in_talent_pool: boolean;
  accepted_terms_at: string | null;
  generated_resume_json: GeneratedResume | null;
  resume_text: string | null;
  created_at: string;
};

type StoreGlobal = typeof globalThis & {
  __wastehire_sessions?: Map<string, IntakeSession>;
  __wastehire_talent?: Array<{
    session_id: string;
    resume: GeneratedResume;
    resume_text: string;
  }>;
};

const g = globalThis as StoreGlobal;
const sessions = g.__wastehire_sessions ?? new Map<string, IntakeSession>();
g.__wastehire_sessions = sessions;
const talentPool =
  g.__wastehire_talent ??
  ([] as Array<{ session_id: string; resume: GeneratedResume; resume_text: string }>);
g.__wastehire_talent = talentPool;

export function createIntakeSession(): IntakeSession {
  const id = `ses_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const session: IntakeSession = {
    id,
    answers: {},
    completed: false,
    opt_in_talent_pool: false,
    accepted_terms_at: null,
    generated_resume_json: null,
    resume_text: null,
    created_at: new Date().toISOString(),
  };
  sessions.set(id, session);
  return session;
}

export function getIntakeSession(id: string): IntakeSession | undefined {
  return sessions.get(id);
}

/** Rehydrate a session from durable storage into this process. */
export function hydrateIntakeSession(session: IntakeSession) {
  sessions.set(session.id, { ...session, answers: { ...session.answers } });
  return sessions.get(session.id)!;
}

export function patchIntakeAnswer(id: string, question_id: string, value: string): IntakeSession | null {
  const s = sessions.get(id);
  if (!s || s.completed) return null;
  s.answers[question_id] = value;
  return s;
}

export function completeIntakeSession(
  id: string,
  opt_in_talent_pool: boolean,
  accepted_terms_at: string,
): { session: IntakeSession; coach: ReturnType<typeof coachFromResume> } | null {
  const s = sessions.get(id);
  if (!s) return null;
  const { generated_resume_json, resume_text } = buildResumeFromAnswers(s.answers);
  s.completed = true;
  s.opt_in_talent_pool = opt_in_talent_pool;
  s.accepted_terms_at = accepted_terms_at;
  s.generated_resume_json = generated_resume_json;
  s.resume_text = resume_text;
  const coach = coachFromResume(generated_resume_json, getJobs());
  if (opt_in_talent_pool) {
    talentPool.push({ session_id: id, resume: generated_resume_json, resume_text });
  }
  return { session: s, coach };
}

export function getTalentPoolShortlist() {
  return talentPool.map((t) => ({
    session_id: t.session_id,
    first_name: t.resume.first_name,
    role_interest: t.resume.role_interest,
    cdl_class: t.resume.cdl_class,
    zip: t.resume.zip,
    resume_text: t.resume_text,
  }));
}

export function resetStoresForTests() {
  sessions.clear();
  talentPool.length = 0;
  jobsCache = null;
}
