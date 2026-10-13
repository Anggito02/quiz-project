-- 009: trending published quizzes by attempts in the last 7 days.
-- Run after 008 in the Supabase SQL Editor.

create or replace function public.trending_quizzes(p_limit integer default 4)
returns table (
  id uuid,
  title text,
  description text,
  course_name text,
  attempt_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    q.id,
    q.title,
    q.description,
    c.name as course_name,
    count(a.id) filter (
      where a.submitted_at >= now() - interval '7 days'
    ) as attempt_count
  from public.quizzes q
  left join public.courses c on c.id = q.course_id
  left join public.attempts a on a.quiz_id = q.id
  where q.status = 'published'
    and (public.is_admin() or public.is_member())
  group by q.id, q.title, q.description, c.name, q.created_at
  having count(a.id) filter (
    where a.submitted_at >= now() - interval '7 days'
  ) > 0
  order by attempt_count desc, q.created_at desc
  limit least(greatest(coalesce(p_limit, 4), 1), 20);
$$;

revoke all on function public.trending_quizzes(integer) from public;
revoke execute on function public.trending_quizzes(integer) from anon;
grant execute on function public.trending_quizzes(integer) to authenticated;
