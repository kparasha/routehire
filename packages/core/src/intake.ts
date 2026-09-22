import type { GeneratedResume } from "./schemas";
import type { Job } from "./schemas";
import { computeUrgencyScore } from "./urgency";

export const INTAKE_QUESTIONS = [
  { id: "first_name", prompt: "What should we call you? (first name)", optional: true },
  { id: "zip", prompt: "What's your ZIP code?" },
  { id: "cdl_class", prompt: "CDL class?", options: ["none", "A", "B"] },
  { id: "endorsements", prompt: "Endorsements? (comma-separated, or none)" },
  { id: "years_experience", prompt: "Years in waste/trucking?" },
  { id: "role_interest", prompt: "Role you're looking for?", options: ["driver", "mechanic", "dispatch", "sales", "pm", "other"] },
  { id: "schedule_preference", prompt: "Schedule?", options: ["home_daily", "regional", "otr"] },
  { id: "pay_band", prompt: "Target pay band?", options: ["under_50k", "50_75k", "75_100k", "100k_plus"] },
  { id: "phone", prompt: "Mobile number (for job alerts)", optional: true },
  { id: "email", prompt: "Email (optional)", optional: true },
] as const;

export type AnswerMap = Record<string, string>;

export function buildResumeFromAnswers(answers: AnswerMap): {
  generated_resume_json: GeneratedResume;
  resume_text: string;
} {
  const endorsementsRaw = answers.endorsements?.trim() || "none";
  const endorsements =
    endorsementsRaw.toLowerCase() === "none"
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

  const lines = [
    generated_resume_json.first_name
      ? `${generated_resume_json.first_name} — Waste industry candidate`
      : "Waste industry candidate",
    `Location ZIP: ${generated_resume_json.zip}`,
    `CDL: ${generated_resume_json.cdl_class === "none" ? "No CDL (open to training)" : `Class ${generated_resume_json.cdl_class}`}`,
    `Endorsements: ${endorsements.length ? endorsements.join(", ") : "None listed"}`,
    `Experience: ${years} year(s)`,
    `Seeking: ${role} · ${schedule.replace("_", " ")}`,
    `Pay target: ${generated_resume_json.pay_band.replace(/_/g, " ")}`,
  ];
  if (generated_resume_json.phone) lines.push(`Contact: ${generated_resume_json.phone}`);
  if (generated_resume_json.email) lines.push(`Email: ${generated_resume_json.email}`);

  return { generated_resume_json, resume_text: lines.join("\n") };
}

export function computeSkillGaps(resume: GeneratedResume, job: Job): string[] {
  const gaps: string[] = [];
  if (job.role_family === "driver" && resume.cdl_class === "none") {
    gaps.push("CDL required — consider company-paid CDL training or helper→driver path");
  }
  if (job.cdl_class && job.cdl_class !== "none" && resume.cdl_class !== job.cdl_class) {
    gaps.push(`Role expects CDL Class ${job.cdl_class}; you listed ${resume.cdl_class}`);
  }
  if (job.role_family === "driver" && !resume.endorsements.some((e) => /air.?brake|tanker|hazmat/i.test(e))) {
    if (job.description_snippet?.match(/hazmat|tanker|air brake/i)) {
      gaps.push("Job may require endorsements — verify air brake / hazmat / tanker");
    }
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
    score += computeUrgencyScore({
      sign_on_bonus_usd: job.sign_on_bonus_usd,
      days_open: job.days_open,
      role_family: job.role_family,
    }) / 10;
    if (resume.schedule_preference === "home_daily" && /local|home/i.test(job.title + job.description_snippet)) {
      score += 15;
    }
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
  const skill_gaps = matched.flatMap((j) => computeSkillGaps(resume, j));
  const uniqueGaps = [...new Set(skill_gaps)];
  const training: string[] = [];
  if (resume.cdl_class === "none" && resume.role_interest === "driver") {
    training.push("Local CDL school or employer-paid training program");
    training.push("Route helper role → internal driver promotion");
  }
  if (uniqueGaps.some((g) => /endorsement/i.test(g))) {
    training.push("DMV endorsement prep (air brakes, tanker, hazmat as needed)");
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
    skill_gaps: uniqueGaps,
    training,
    matched_job_ids,
  };
}
