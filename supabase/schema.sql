-- Sarx — profiles table + Row Level Security
-- Run this once in the Supabase SQL Editor (Dashboard > SQL Editor > New query).
-- Mirrors the bm_* localStorage keys used across script.js, healthindex.js, and goal.js.

create table public.profiles (
  user_id     uuid primary key references auth.users (id) on delete cascade,

  -- onboarding inputs
  age         smallint,
  height_ft   smallint,
  height_in   smallint,
  weight      numeric,
  sex         text check (sex in ('male', 'female')),
  activity    numeric,

  -- calculated health index
  bmi         numeric,
  bmi_cat     text,
  bmr         integer,
  tdee        integer,
  body_fat    numeric,
  ideal_min   numeric,
  ideal_max   numeric,
  min_weight  numeric,
  status      text,

  -- plan inputs
  goal              text,
  intensity         text,
  diet              text,
  target_cal        integer,
  goal_weight       numeric,
  target_cal_custom boolean not null default false, -- true once the user types their own calorie target

  updated_at  timestamptz not null default now()
);

-- Row Level Security: a user can only ever see or touch their own row.
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Keep updated_at current on every write.
create function public.handle_profile_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_update
  before update on public.profiles
  for each row execute function public.handle_profile_updated_at();
