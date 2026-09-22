import { z } from "zod";

export const RoleFamily = z.enum([
  "driver",
  "mechanic",
  "dispatch",
  "sales",
  "pm",
  "other",
]);
export type RoleFamily = z.infer<typeof RoleFamily>;

export const ScheduleType = z.enum(["home_daily", "regional", "otr"]);
export type ScheduleType = z.infer<typeof ScheduleType>;

export const EquipmentType = z.enum([
  "roll_off",
  "residential",
  "front_load",
  "commercial",
  "shop",
  "office",
  "other",
]);
export type EquipmentType = z.infer<typeof EquipmentType>;

export const JobSchema = z.object({
  id: z.string(),
  source_id: z.string(),
  external_id: z.string().optional(),
  title: z.string(),
  employer_name: z.string(),
  location: z.string(),
  role_family: RoleFamily,
  cdl_class: z.enum(["none", "A", "B"]).optional(),
  schedule: ScheduleType.default("home_daily"),
  equipment: EquipmentType.optional(),
  sign_on_bonus_usd: z.number().nullable(),
  salary_min: z.number().nullable(),
  salary_max: z.number().nullable(),
  pay_display: z.string().optional(),
  urgency_score: z.number().min(0).max(100),
  trending: z.boolean(),
  days_open: z.number().int().nonnegative(),
  apply_url: z.string().url(),
  description_snippet: z.string().optional(),
  posted_at: z.string().optional(),
});
export type Job = z.infer<typeof JobSchema>;

export const IntakeAnswerSchema = z.object({
  question_id: z.string(),
  value: z.string(),
});

export const GeneratedResumeSchema = z.object({
  first_name: z.string().optional(),
  zip: z.string(),
  cdl_class: z.enum(["none", "A", "B"]),
  endorsements: z.array(z.string()),
  years_experience: z.number(),
  role_interest: RoleFamily,
  schedule_preference: z.enum(["home_daily", "regional", "otr"]),
  pay_band: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
});
export type GeneratedResume = z.infer<typeof GeneratedResumeSchema>;

export const CoachResultSchema = z.object({
  resume_text: z.string(),
  generated_resume_json: GeneratedResumeSchema,
  skill_gaps: z.array(z.string()),
  training: z.array(z.string()),
  matched_job_ids: z.array(z.string()),
});

export const HireResultSchema = z.object({
  contingent_fee_usd: z.number(),
  guarantee_days: z.literal(90),
});
