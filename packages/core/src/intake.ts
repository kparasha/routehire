import type { GeneratedResume } from "./schemas";
import type { Job } from "./schemas";
import { computeUrgencyScore } from "./urgency";

export type Question = {
  id: string;
  prompt: string;
  optional?: boolean;
  options?: readonly string[];
  agent_line?: string;
};

/** Legacy flat list — tests / OpenAPI still accept these ids */
export const INTAKE_QUESTIONS: Question[] = [
  { id: "role_interest", prompt: "What seat are you after?", options: ["driver", "mechanic", "dispatch", "sales", "pm", "other"] },
  { id: "first_name", prompt: "First name?" },
  { id: "zip", prompt: "ZIP code?" },
  { id: "cdl_class", prompt: "CDL class?", options: ["none", "A", "B"] },
  { id: "endorsements", prompt: "Endorsements? (or none)", optional: true },
  { id: "years_experience", prompt: "Years experience?" },
  { id: "schedule_preference", prompt: "Schedule?", options: ["home_daily", "regional", "otr"] },
  { id: "equipment", prompt: "Equipment?", options: ["roll_off", "residential", "front_load", "any"] },
  { id: "pay_band", prompt: "Pay target?", options: ["under_50k", "50_75k", "75_100k", "100k_plus"] },
  { id: "phone", prompt: "Mobile (so haulers can call)?" },
  { id: "email", prompt: "Email?", optional: true },
];

export type AnswerMap = Record<string, string>;

const Q = {
  role: {
    id: "role_interest",
    prompt: "Which job are you looking for?",
    agent_line: "First — what kind of seat?",
    options: ["driver", "mechanic", "dispatch", "sales", "pm", "other"],
  },
  name: {
    id: "first_name",
    prompt: "What should we call you?",
    agent_line: "Got it — first name? Haulers ask for you by name.",
  },
  zip: {
    id: "zip",
    prompt: "What’s your ZIP?",
    agent_line: "Where should we look for local seats?",
  },
  cdl: {
    id: "cdl_class",
    prompt: "CDL class?",
    agent_line: "Do you have a CDL — and which class?",
    options: ["none", "B", "A"],
  },
  endorsements: {
    id: "endorsements",
    prompt: "Any endorsements? (air brake, tanker… or none)",
    agent_line: "Endorsements help match roll-off and specialty routes.",
    optional: true,
  },
  equipment: {
    id: "equipment",
    prompt: "Preferred truck / route?",
    agent_line: "Roll-off, residential, or front-load?",
    options: ["roll_off", "residential", "front_load", "any"],
  },
  years_driver: {
    id: "years_experience",
    prompt: "Years driving or on routes?",
    agent_line: "How long have you been on the road or helping routes?",
  },
  years_shop: {
    id: "years_experience",
    prompt: "Years in diesel / fleet shop?",
    agent_line: "How many years in the shop?",
  },
  years_ops: {
    id: "years_experience",
    prompt: "Years in dispatch / ops?",
    agent_line: "How long in ops or dispatch?",
  },
  years_sales: {
    id: "years_experience",
    prompt: "Years in B2B / waste sales?",
    agent_line: "Sales experience?",
  },
  years_generic: {
    id: "years_experience",
    prompt: "Years relevant experience?",
    agent_line: "How many years in this kind of work?",
  },
  schedule: {
    id: "schedule_preference",
    prompt: "Schedule preference?",
    agent_line: "Most hauler seats are home daily — that work for you?",
    options: ["home_daily", "regional", "otr"],
  },
  pay: {
    id: "pay_band",
    prompt: "Target pay?",
    agent_line: "What pay band are you aiming for?",
    options: ["under_50k", "50_75k", "75_100k", "100k_plus"],
  },
  phone: {
    id: "phone",
    prompt: "Best mobile number?",
    agent_line: "Haulers call when there’s a seat — what’s your mobile?",
  },
  email: {
    id: "email",
    prompt: "Email? (optional)",
    agent_line: "Email if you want a copy of your profile — or skip.",
    optional: true,
  },
} as const;

function has(answers: AnswerMap, key: string) {
  return Object.prototype.hasOwnProperty.call(answers, key);
}

/**
 * Thin adaptive harness: ask role first, then only questions that matter for that seat.
 */
export function nextIntakeQuestion(answers: AnswerMap): Question | null {
  if (!answers.role_interest) return { ...Q.role };
  if (!answers.first_name?.trim()) return { ...Q.name };
  if (!answers.zip) return { ...Q.zip };

  const role = answers.role_interest;

  if (role === "driver") {
    if (!answers.cdl_class) return { ...Q.cdl };
    if (answers.cdl_class !== "none" && !has(answers, "endorsements")) {
      return { ...Q.endorsements };
    }
    if (!answers.equipment) return { ...Q.equipment };
    if (!answers.years_experience) return { ...Q.years_driver };
  } else if (role === "mechanic") {
    if (!answers.years_experience) return { ...Q.years_shop };
    if (!has(answers, "cdl_class")) {
      return {
        id: "cdl_class",
        prompt: "Any CDL? (shop roles often none)",
        agent_line: "CDL optional for shop — what do you have?",
        options: ["none", "B", "A"],
      };
    }
  } else if (role === "dispatch") {
    if (!answers.years_experience) return { ...Q.years_ops };
  } else if (role === "sales") {
    if (!answers.years_experience) return { ...Q.years_sales };
  } else {
    if (!answers.years_experience) return { ...Q.years_generic };
  }

  if (!answers.schedule_preference) return { ...Q.schedule };
  if (!answers.pay_band) return { ...Q.pay };
  if (!answers.phone?.trim()) return { ...Q.phone };
  if (!has(answers, "email")) return { ...Q.email };
  return null;
}

export function isIntakeComplete(answers: AnswerMap): boolean {
  return nextIntakeQuestion(answers) === null;
}

export function buildResumeFromAnswers(answers: AnswerMap): {
  generated_resume_json: GeneratedResume;
  resume_text: string;
} {
  const endorsementsRaw = answers.endorsements?.trim() || "none";
  const endorsements =
    !endorsementsRaw || endorsementsRaw.toLowerCase() === "none"
      ? []
      : endorsementsRaw.split(",").map((s) => s.trim()).filter(Boolean);

  const years = parseInt(answers.years_experience || "0", 10) || 0;
  const cdl = (answers.cdl_class || "none") as "none" | "A" | "B";
  const role = (answers.role_interest || "driver") as GeneratedResume["role_interest"];
  const schedule = (answers.schedule_preference || "home_daily") as GeneratedResume["schedule_preference"];

  const generated_resume_json: GeneratedResume = {
    first_name: answers.first_name || undefined,
    zip: answers.zip || "00000",
    cdl_class: cdl,
    endorsements,
    years_experience: years,
    role_interest: role,
    schedule_preference: schedule,
    pay_band: answers.pay_band || "50_75k",
    phone: answers.phone || undefined,
    email: answers.email || undefined,
  };

  const equip = answers.equipment && answers.equipment !== "any" ? answers.equipment.replace(/_/g, "-") : null;
  const lines = [
    generated_resume_json.first_name
      ? `${generated_resume_json.first_name} — ${role}`
      : `Waste industry · ${role}`,
    `ZIP ${generated_resume_json.zip}`,
    `CDL: ${generated_resume_json.cdl_class === "none" ? "None / open to training" : `Class ${generated_resume_json.cdl_class}`}`,
    endorsements.length ? `Endorsements: ${endorsements.join(", ")}` : null,
    equip ? `Equipment: ${equip}` : null,
    `${years} year(s) · ${schedule.replace(/_/g, " ")}`,
    `Pay target: ${generated_resume_json.pay_band.replace(/_/g, " ")}`,
    generated_resume_json.phone ? `Phone: ${generated_resume_json.phone}` : null,
    generated_resume_json.email ? `Email: ${generated_resume_json.email}` : null,
  ].filter(Boolean) as string[];

  return { generated_resume_json, resume_text: lines.join("\n") };
}

export function computeSkillGaps(resume: GeneratedResume, job: Job): string[] {
  const gaps: string[] = [];
  if (job.role_family === "driver" && resume.cdl_class === "none") {
    gaps.push("CDL required — helper→driver or company-paid training");
  }
  if (job.cdl_class && job.cdl_class !== "none" && resume.cdl_class !== job.cdl_class) {
    gaps.push(`Seat wants CDL ${job.cdl_class}; you listed ${resume.cdl_class}`);
  }
  return gaps;
}

export function matchJobs(resume: GeneratedResume, jobs: Job[], limit = 5): string[] {
  const scored = jobs.map((job) => {
    let score = 0;
    if (job.role_family === resume.role_interest) score += 40;
    if (job.cdl_class === resume.cdl_class || job.cdl_class === "none" || resume.cdl_class === "A") {
      score += 20;
    }
    if (job.location.toLowerCase().includes(resume.zip.slice(0, 3))) score += 10;
    score +=
      computeUrgencyScore({
        sign_on_bonus_usd: job.sign_on_bonus_usd,
        days_open: job.days_open,
        role_family: job.role_family,
      }) / 10;
    if (resume.schedule_preference === "home_daily" && job.schedule === "home_daily") score += 15;
    return { id: job.id, score };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .filter((s) => s.score > 25)
    .map((s) => s.id);
}

export function coachFromResume(resume: GeneratedResume, jobs: Job[]) {
  const matched_job_ids = matchJobs(resume, jobs);
  const matched = jobs.filter((j) => matched_job_ids.includes(j.id));
  const skill_gaps = [...new Set(matched.flatMap((j) => computeSkillGaps(resume, j)))];
  const training: string[] = [];
  if (resume.cdl_class === "none" && resume.role_interest === "driver") {
    training.push("Company-paid CDL or helper→driver path");
  }
  const { resume_text } = buildResumeFromAnswers({
    first_name: resume.first_name || "",
    zip: resume.zip,
    cdl_class: resume.cdl_class,
    endorsements: resume.endorsements.join(", ") || "none",
    years_experience: String(resume.years_experience),
    role_interest: resume.role_interest,
    schedule_preference: resume.schedule_preference,
    pay_band: resume.pay_band,
    phone: resume.phone || "",
    email: resume.email || "",
  });
  return {
    resume_text,
    generated_resume_json: resume,
    skill_gaps,
    training,
    matched_job_ids,
  };
}
