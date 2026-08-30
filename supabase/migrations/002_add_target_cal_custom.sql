-- Adds the flag that marks a user-typed calorie target so it stops getting
-- silently overwritten by the goal/intensity auto-calculation.
alter table public.profiles
  add column target_cal_custom boolean not null default false;
