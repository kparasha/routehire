-- Production schema (MVP uses in-memory; wire Supabase when ready)

create table if not exists jobs (
  id text primary key,
  source_id text not null,
  external_id text,
  title text not null,
  employer_name text not null,
  location text not null,
  role_family text not null,
  cdl_class text,
  sign_on_bonus_usd numeric,
  salary_min numeric,
  salary_max numeric,
  urgency_score int not null,
  trending boolean default false,
  days_open int default 0,
  apply_url text not null,
  description_snippet text,
  posted_at timestamptz,
  ingested_at timestamptz default now()
);

alter table jobs enable row level security;
create policy "public read jobs" on jobs for select using (true);

create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  opt_in_talent_pool boolean not null default false,
  accepted_terms_at timestamptz,
  generated_resume_json jsonb,
  resume_text text,
  created_at timestamptz default now()
);

alter table candidates enable row level security;
create policy "no anon read candidates" on candidates for select using (false);
