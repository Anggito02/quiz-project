-- 007: let an admin clear leaderboard scores used for dummy testing.
-- Run after 006 in the Supabase SQL Editor. Do not edit 001-006.

create or replace function public.reset_leaderboard(
  p_quiz_id uuid default null,
  p_duration integer default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;

  if p_duration is not null and p_duration not in (5, 10, 20) then
    raise exception 'invalid duration';
  end if;

  if p_quiz_id is null and p_duration is null then
    delete from public.attempts;
    delete from public.unlimited_sessions;
    return;
  end if;

  if p_quiz_id is not null then
    delete from public.attempts where quiz_id = p_quiz_id;
  end if;

  if p_duration is not null then
    delete from public.unlimited_sessions where duration_minutes = p_duration;
  end if;
end;
$$;

revoke all on function public.reset_leaderboard(uuid, integer) from public;
revoke execute on function public.reset_leaderboard(uuid, integer) from anon;
grant execute on function public.reset_leaderboard(uuid, integer) to authenticated;
