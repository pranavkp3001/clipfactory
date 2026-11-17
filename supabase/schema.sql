-- Clip Factory persistence schema (run in Supabase SQL Editor)
create extension if not exists pgcrypto;

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brief text not null default '',
  source_url text,
  platform text not null default 'youtube',
  payout_model text,
  payout_rate numeric,
  currency text not null default 'USD',
  status text not null default 'draft',
  parsed_rules jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clipping_jobs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete set null,
  openshorts_job_id text unique not null,
  source_url text not null,
  status text not null default 'queued',
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists clips (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references clipping_jobs(id) on delete cascade,
  clip_index integer not null,
  title text,
  video_url text,
  download_url text,
  duration_seconds numeric,
  aspect_ratio text,
  eligibility_status text not null default 'REVIEW',
  eligibility_checks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique(job_id, clip_index)
);

create table if not exists social_posts (
  id uuid primary key default gen_random_uuid(),
  clip_id uuid references clips(id) on delete set null,
  platform text not null,
  external_post_id text,
  status text not null default 'pending',
  views bigint,
  eligible_views bigint,
  estimated_earnings numeric,
  confirmed_earnings numeric,
  currency text not null default 'USD',
  published_at timestamptz,
  last_synced_at timestamptz,
  raw_analytics jsonb not null default '{}'::jsonb
);

create table if not exists campaign_submissions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  clip_id uuid not null references clips(id) on delete cascade,
  external_submission_id text,
  status text not null default 'not_submitted',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  rejection_reason text
);

create index if not exists idx_jobs_campaign on clipping_jobs(campaign_id);
create index if not exists idx_clips_job on clips(job_id);
create index if not exists idx_posts_clip on social_posts(clip_id);
