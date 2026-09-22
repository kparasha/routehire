-- RouteHire persistence (wire when SUPABASE_URL set)

create table if not exists jobs (
  id text primary key,
  source_id text not null,
  external_id text,
  title text not null,
  employer_name text not null,
  location text not null,
  role_family text not null,
  cdl_class text,
  schedule text not null default 'home_daily',
  equipment text,
  sign_on_bonus_usd numeric,
  salary_min numeric,
  salary_max numeric,
  pay_display text,
  urgency_score int not null,
  trending boolean default false,
  days_open int default 0,
  apply_url text not null,
  description_snippet text,
  posted_at timestamptz,
  ingested_at timestamptz default now()
);

alter table jobs enable row level security;
drop policy if exists "public read jobs" on jobs;
create policy "public read jobs" on jobs for select using (true);

create table if not exists intake_sessions (
  id text primary key,
  answers jsonb not null default '{}',
  completed boolean not null default false,
  opt_in_talent_pool boolean not null default false,
  accepted_terms_at timestamptz,
  generated_resume_json jsonb,
  resume_text text,
  created_at timestamptz default now()
);

alter table intake_sessions enable row level security;
drop policy if exists "no anon read intake" on intake_sessions;
create policy "no anon read intake" on intake_sessions for select using (false);

create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  session_id text references intake_sessions(id),
  opt_in_talent_pool boolean not null default false,
  accepted_terms_at timestamptz,
  generated_resume_json jsonb,
  resume_text text,
  created_at timestamptz default now()
);

alter table candidates enable row level security;
drop policy if exists "no anon read candidates" on candidates;
create policy "no anon read candidates" on candidates for select using (false);

create table if not exists hires (
  id uuid primary key default gen_random_uuid(),
  job_id text,
  candidate_session_id text,
  contingent_fee_usd numeric not null,
  guarantee_days int not null default 90,
  created_at timestamptz default now()
);

alter table hires enable row level security;
drop policy if exists "no anon read hires" on hires;
create policy "no anon read hires" on hires for select using (false);
