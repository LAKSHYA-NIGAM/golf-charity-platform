-- ═══════════════════════════════════════════════════════════════════════════
--  GreenHeart — Supabase Database Schema
--  Run this entire file in: Supabase Dashboard → SQL Editor → New Query
--  Order matters — dependencies first.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Enable required extensions ───────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ════════════════════════════════════════════════════════════════
--  CHARITIES
-- ════════════════════════════════════════════════════════════════
create table if not exists charities (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  category         text not null,
  description      text,
  website          text,
  emoji            text default '💚',
  featured         boolean default false,
  active           boolean default true,
  total_raised     numeric(12,2) default 0,
  subscribers_count integer default 0,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ════════════════════════════════════════════════════════════════
--  USERS
-- ════════════════════════════════════════════════════════════════
create table if not exists users (
  id                          uuid primary key default uuid_generate_v4(),
  email                       text not null unique,
  password_hash               text not null,
  full_name                   text not null,
  phone                       text,
  role                        text not null default 'subscriber'
                                check (role in ('subscriber', 'admin')),

  -- Subscription
  subscription_status         text not null default 'pending'
                                check (subscription_status in (
                                  'pending','active','cancelled','lapsed','suspended'
                                )),
  plan                        text default 'monthly'
                                check (plan in ('monthly','yearly')),
  stripe_customer_id          text unique,
  stripe_subscription_id      text unique,
  subscription_activated_at   timestamptz,
  subscription_renewal_date   timestamptz,

  -- Charity
  charity_id                  uuid references charities(id) on delete set null,
  extra_contribution          numeric(6,2) default 0 check (extra_contribution >= 0),

  created_at                  timestamptz default now(),
  updated_at                  timestamptz default now()
);

create index if not exists idx_users_email               on users(email);
create index if not exists idx_users_subscription_status on users(subscription_status);
create index if not exists idx_users_stripe_customer     on users(stripe_customer_id);

-- ════════════════════════════════════════════════════════════════
--  SCORES
-- ════════════════════════════════════════════════════════════════
create table if not exists scores (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references users(id) on delete cascade,
  score       integer not null check (score >= 1 and score <= 45),
  played_at   date not null,
  course_name text,
  created_at  timestamptz default now()
);

create index if not exists idx_scores_user_id   on scores(user_id);
create index if not exists idx_scores_played_at on scores(played_at desc);

-- Enforce max 5 scores per user via trigger
create or replace function enforce_max_five_scores()
returns trigger language plpgsql as $$
declare
  oldest_id uuid;
  current_count integer;
begin
  select count(*) into current_count from scores where user_id = new.user_id;
  if current_count >= 5 then
    select id into oldest_id
      from scores
      where user_id = new.user_id
      order by played_at asc, created_at asc
      limit 1;
    delete from scores where id = oldest_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_max_five_scores on scores;
create trigger trg_max_five_scores
  before insert on scores
  for each row execute function enforce_max_five_scores();

-- ════════════════════════════════════════════════════════════════
--  DRAWS
-- ════════════════════════════════════════════════════════════════
create table if not exists draws (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  draw_date        date not null,
  status           text not null default 'scheduled'
                     check (status in ('scheduled','in_progress','completed','cancelled')),
  numbers          integer[],              -- drawn numbers [n1,n2,n3,n4,n5]
  total_pool       numeric(12,2) default 0,
  jackpot_carry    numeric(12,2) default 0, -- rolled-over jackpot from previous
  jackpot_won      boolean,
  jackpot_rollover numeric(12,2) default 0, -- amount rolled to next draw
  winners_count    integer default 0,
  completed_at     timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists idx_draws_status    on draws(status);
create index if not exists idx_draws_draw_date on draws(draw_date desc);

-- ════════════════════════════════════════════════════════════════
--  DRAW PARTICIPANTS  (one row per user per draw)
-- ════════════════════════════════════════════════════════════════
create table if not exists draw_participants (
  id               uuid primary key default uuid_generate_v4(),
  draw_id          uuid not null references draws(id) on delete cascade,
  user_id          uuid not null references users(id) on delete cascade,
  user_numbers     integer[],     -- their 5 scores at draw time
  matched_count    integer default 0,
  matched_numbers  integer[],
  created_at       timestamptz default now(),
  unique (draw_id, user_id)
);

create index if not exists idx_draw_participants_draw   on draw_participants(draw_id);
create index if not exists idx_draw_participants_user   on draw_participants(user_id);
create index if not exists idx_draw_participants_match  on draw_participants(matched_count desc);

-- ════════════════════════════════════════════════════════════════
--  WINNINGS
-- ════════════════════════════════════════════════════════════════
create table if not exists winnings (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references users(id) on delete cascade,
  draw_id          uuid not null references draws(id) on delete cascade,
  match_type       text not null,          -- '3-Match', '4-Match', '5-Match'
  matched_numbers  integer[],
  prize_amount     numeric(10,2) not null check (prize_amount > 0),
  status           text not null default 'pending_upload'
                     check (status in (
                       'pending_upload','pending_verification',
                       'verified','paid','rejected'
                     )),
  proof_url        text,
  submitted_at     timestamptz,
  verified_by      uuid references users(id),
  verified_at      timestamptz,
  paid_at          timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists idx_winnings_user_id on winnings(user_id);
create index if not exists idx_winnings_status  on winnings(status);
create index if not exists idx_winnings_draw_id on winnings(draw_id);

-- ════════════════════════════════════════════════════════════════
--  CHARITY CONTRIBUTIONS  (logged on each successful payment)
-- ════════════════════════════════════════════════════════════════
create table if not exists charity_contributions (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references users(id) on delete cascade,
  charity_id          uuid not null references charities(id),
  amount              numeric(8,2) not null check (amount > 0),
  contribution_date   timestamptz default now(),
  stripe_payment_id   text
);

create index if not exists idx_contributions_charity on charity_contributions(charity_id);
create index if not exists idx_contributions_user    on charity_contributions(user_id);

-- ════════════════════════════════════════════════════════════════
--  HELPER FUNCTIONS
-- ════════════════════════════════════════════════════════════════

-- Increment charity total_raised atomically
create or replace function increment_charity_total(
  p_charity_id uuid,
  p_amount     numeric
) returns void language plpgsql as $$
begin
  update charities
  set total_raised = total_raised + p_amount,
      updated_at   = now()
  where id = p_charity_id;
end;
$$;

-- Increment charity subscriber count
create or replace function increment_charity_subscribers(p_charity_id uuid, delta integer default 1)
returns void language plpgsql as $$
begin
  update charities
  set subscribers_count = greatest(0, subscribers_count + delta),
      updated_at = now()
  where id = p_charity_id;
end;
$$;

-- Auto-update updated_at on any table
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at trigger to all relevant tables
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_users_updated_at') then
    create trigger trg_users_updated_at before update on users for each row execute function set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_draws_updated_at') then
    create trigger trg_draws_updated_at before update on draws for each row execute function set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_charities_updated_at') then
    create trigger trg_charities_updated_at before update on charities for each row execute function set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_winnings_updated_at') then
    create trigger trg_winnings_updated_at before update on winnings for each row execute function set_updated_at();
  end if;
end $$;

-- ════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
-- ════════════════════════════════════════════════════════════════
-- NOTE: Your backend uses the service role key which bypasses RLS.
-- These policies protect direct client-side access if you ever use
-- the anon/user JWT approach from the frontend.

alter table users                 enable row level security;
alter table scores                enable row level security;
alter table draw_participants     enable row level security;
alter table winnings              enable row level security;
alter table charity_contributions enable row level security;
alter table draws                 enable row level security;
alter table charities             enable row level security;

-- Service role bypasses everything — backend is safe.
-- Anon / authenticated policies for any future client-side use:

-- Charities: public read
create policy "charities_public_read" on charities
  for select using (active = true);

-- Draws: public read for completed/scheduled
create policy "draws_public_read" on draws
  for select using (status in ('completed','scheduled'));

-- ════════════════════════════════════════════════════════════════
--  STORAGE BUCKET
-- ════════════════════════════════════════════════════════════════
-- Run this separately in the Supabase Dashboard → Storage → New Bucket,
-- OR execute via the Supabase Management API.
-- Bucket name: winner-proofs
-- Public: false (private, admin-only access for verification)
--
-- If you want to create it via SQL (requires pg_net or Supabase JS SDK):
-- insert into storage.buckets (id, name, public)
--   values ('winner-proofs', 'winner-proofs', false)
--   on conflict do nothing;

-- ════════════════════════════════════════════════════════════════
--  SEED DATA — Charities
-- ════════════════════════════════════════════════════════════════
insert into charities (name, category, description, website, emoji, featured, total_raised, subscribers_count)
values
  ('St. Vincent de Paul',     'Poverty Relief', 'SVP supports over 140,000 people in Ireland every year through a network of volunteers helping families in need.', 'https://svp.ie',            '🏠', true,  42100, 312),
  ('Irish Heart Foundation',  'Health',         'Saving lives by preventing and reducing the impact of heart disease and stroke across Ireland.', 'https://irishheart.ie',     '❤️', true,  38500, 287),
  ('Focus Ireland',           'Homelessness',   'Working to prevent people from becoming homeless and to help those who are homeless to find a stable home.', 'https://focusireland.ie',   '🌿', false, 29800, 218),
  ('ISPCC Childline',         'Child Safety',   'Providing a 24-hour listening service for children and young people up to 18 years facing difficulties.', 'https://ispcc.ie',          '📞', false, 24600, 189),
  ('Pieta House',             'Health',         'Providing a range of free, therapeutic services to people in suicidal distress or who engage in self-harm.', 'https://pieta.ie',          '💜', false, 21300, 156),
  ('Goal Global',             'Poverty Relief', 'International humanitarian organisation responding to the needs of the most vulnerable worldwide.', 'https://goal.ie',           '🌍', false, 18700, 134),
  ('Irish Wildlife Trust',    'Environment',    'Working for the conservation and protection of Ireland''s wildlife through education, advocacy and action.', 'https://iwt.ie',            '🦋', false, 14200,  98),
  ('Barretstown',             'Health',         'Providing life-changing therapeutic recreation for children living with serious illness and their families.', 'https://barretstown.org',   '⭐', false, 12800,  87),
  ('Simon Community',         'Homelessness',   'Providing housing, health and social care services to people experiencing homelessness since 1969.', 'https://simon.ie',          '🏘️', false, 11400,  76),
  ('Aware',                   'Health',         'Supporting people impacted by depression, bipolar disorder and related mood conditions across Ireland.', 'https://aware.ie',          '🌈', false,  9600,  64),
  ('An Taisce',               'Environment',    'Ireland''s National Trust, protecting and promoting the natural and built heritage of Ireland since 1948.', 'https://antaisce.org',      '🌲', false,  7800,  52),
  ('Down Syndrome Ireland',   'Health',         'Supporting people with Down Syndrome and their families through information, advocacy and community.', 'https://downsyndrome.ie',   '🧡', false,  6200,  43)
on conflict do nothing;

-- ════════════════════════════════════════════════════════════════
--  SEED DATA — Admin user
--  Password: admin123 (bcrypt hash — change immediately in prod!)
-- ════════════════════════════════════════════════════════════════
insert into users (email, password_hash, full_name, role, subscription_status, plan)
values (
  'admin@greenheart.io',
  '$2a$12$B/FbGCRe/tpX.upF7J0heunGeosZWjHR8jw7xk51MGSTgrDWJ4zr.',  -- admin123
  'GreenHeart Admin',
  'admin',
  'active',
  'yearly'
)
on conflict (email) do nothing;

-- ════════════════════════════════════════════════════════════════
--  SEED DATA — Sample draws
-- ════════════════════════════════════════════════════════════════
insert into draws (name, draw_date, status, numbers, total_pool, winners_count, jackpot_won, completed_at)
values
  ('December 2024 Draw', '2024-12-31', 'completed', array[3,11,22,29,40], 28000, 42, false, '2024-12-31 20:00:00+00'),
  ('January 2025 Draw',  '2025-01-31', 'completed', array[7,14,23,31,38], 35500, 52, false, '2025-01-31 20:00:00+00'),
  ('February 2025 Draw', '2025-02-28', 'scheduled', null,                  38200,  0, null,  null)
on conflict do nothing;
