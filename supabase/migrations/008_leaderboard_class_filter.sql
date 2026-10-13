-- 008: rank a leaderboard inside one class when a class is selected.
-- Run after 007 in the Supabase SQL Editor.

drop function if exists public.quiz_leaderboard(uuid);
drop function if exists public.unlimited_leaderboard(integer);

create function public.quiz_leaderboard(p_quiz_id uuid, p_class_id uuid default null)
returns table (
  rank bigint,
  student_id uuid,
  display_name text,
  score integer,
  submitted_at timestamptz,
  attempt_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with visible as (
    select 1
    from public.quizzes q
    where q.id = p_quiz_id
      and (public.is_admin() or (public.is_member() and q.status = 'published'))
  ),
  best as (
    select distinct on (a.student_id)
      a.student_id, a.score, a.submitted_at
    from public.attempts a
    where a.quiz_id = p_quiz_id
      and exists (select 1 from visible)
    order by a.student_id, a.score desc, a.submitted_at asc
  ),
  counts as (
    select a.student_id, count(*) as attempt_count
    from public.attempts a
    where a.quiz_id = p_quiz_id
    group by a.student_id
  )
  select
    row_number() over (order by b.score desc, b.submitted_at asc, p.display_name asc) as rank,
    b.student_id,
    p.display_name,
    b.score,
    b.submitted_at,
    c.attempt_count
  from best b
  join public.profiles p on p.id = b.student_id
  join counts c on c.student_id = b.student_id
  where p_class_id is null or p.class_id = p_class_id
  order by rank
  limit 100;
$$;

create function public.unlimited_leaderboard(p_duration integer, p_class_id uuid default null)
returns table (
  rank bigint,
  student_id uuid,
  display_name text,
  correct_count integer,
  submitted_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with best as (
    select distinct on (s.student_id)
      s.student_id, s.correct_count, s.submitted_at
    from public.unlimited_sessions s
    where s.duration_minutes = p_duration
      and s.submitted_at is not null
      and public.is_member()
    order by s.student_id, s.correct_count desc, s.submitted_at asc
  )
  select
    row_number() over (order by b.correct_count desc, b.submitted_at asc, p.display_name asc) as rank,
    b.student_id,
    p.display_name,
    b.correct_count,
    b.submitted_at
  from best b
  join public.profiles p on p.id = b.student_id
  where p_class_id is null or p.class_id = p_class_id
  order by rank
  limit 100;
$$;

revoke all on function public.quiz_leaderboard(uuid, uuid) from public;
revoke execute on function public.quiz_leaderboard(uuid, uuid) from anon;
grant execute on function public.quiz_leaderboard(uuid, uuid) to authenticated;

revoke all on function public.unlimited_leaderboard(integer, uuid) from public;
revoke execute on function public.unlimited_leaderboard(integer, uuid) from anon;
grant execute on function public.unlimited_leaderboard(integer, uuid) to authenticated;
