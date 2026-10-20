-- 011: performance. Run after 010 in the Supabase SQL Editor.
-- 1. Roster lookups use the email primary key first and only scan wildcard rules when needed.
-- 2. RLS policies wrap is_admin(), is_member() and auth.uid() in (select ...), so Postgres
--    evaluates them once per query instead of once per row.
-- 3. Roster changes resync only the profiles they affect.
-- 4. Indexes for foreign keys, leaderboards, and trending.

-- 1. Roster matching -------------------------------------------------------

create or replace function public.email_matches_rule(p_email text, p_rule text)
returns boolean
language sql
immutable
parallel safe
set search_path = ''
as $$
  select case
    when coalesce(trim(p_email), '') = '' or coalesce(trim(p_rule), '') = '' then false
    when position('*' in p_rule) = 0 then lower(trim(p_email)) = lower(trim(p_rule))
    else lower(trim(p_email)) like replace(
      replace(replace(replace(lower(trim(p_rule)), '\', '\\'), '%', '\%'), '_', '\_'),
      '*', '%'
    ) escape '\'
  end;
$$;

create or replace function public.roster_match(p_email text)
returns table (role text, class_id uuid, rule text)
language sql
stable
security definer
set search_path = ''
as $$
  with target as (
    select lower(trim(coalesce(p_email, ''))) as email
  ),
  exact as (
    select a.role, a.class_id, a.email as rule
    from public.allowed_emails a, target t
    where a.email = t.email
      and position('*' in a.email) = 0
  ),
  wildcard as (
    select a.role, a.class_id, a.email as rule
    from public.allowed_emails a, target t
    where position('*' in a.email) > 0
      and not exists (select 1 from exact)
      and public.email_matches_rule(t.email, a.email)
    order by char_length(replace(a.email, '*', '')) desc, a.created_at asc
    limit 1
  )
  select * from exact
  union all
  select * from wildcard
  limit 1;
$$;

create index if not exists allowed_emails_wildcard_idx
  on public.allowed_emails (created_at)
  where position('*' in email) > 0;

-- 2. RLS policies -----------------------------------------------------------

drop policy if exists "admins read allowlist" on public.allowed_emails;
drop policy if exists "admins add allowlist" on public.allowed_emails;
drop policy if exists "admins change allowlist" on public.allowed_emails;
drop policy if exists "admins remove allowlist" on public.allowed_emails;
create policy "admins read allowlist" on public.allowed_emails
  for select to authenticated using ((select public.is_admin()));
create policy "admins add allowlist" on public.allowed_emails
  for insert to authenticated with check ((select public.is_admin()));
create policy "admins change allowlist" on public.allowed_emails
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins remove allowlist" on public.allowed_emails
  for delete to authenticated using ((select public.is_admin()));

drop policy if exists "members read profiles" on public.profiles;
drop policy if exists "admins rename profiles" on public.profiles;
create policy "members read profiles" on public.profiles
  for select to authenticated using ((select public.is_member()));
create policy "admins rename profiles" on public.profiles
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "read visible quizzes" on public.quizzes;
drop policy if exists "admins add quizzes" on public.quizzes;
drop policy if exists "admins change quizzes" on public.quizzes;
drop policy if exists "admins remove quizzes" on public.quizzes;
create policy "read visible quizzes" on public.quizzes
  for select to authenticated
  using (
    (select public.is_admin())
    or ((select public.is_member()) and status = 'published')
  );
create policy "admins add quizzes" on public.quizzes
  for insert to authenticated with check ((select public.is_admin()));
create policy "admins change quizzes" on public.quizzes
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins remove quizzes" on public.quizzes
  for delete to authenticated using ((select public.is_admin()));

drop policy if exists "read visible questions" on public.questions;
drop policy if exists "admins add questions" on public.questions;
drop policy if exists "admins change questions" on public.questions;
drop policy if exists "admins remove questions" on public.questions;
create policy "read visible questions" on public.questions
  for select to authenticated
  using (
    (select public.is_admin())
    or (
      (select public.is_member())
      and exists (
        select 1 from public.quizzes q
        where q.id = questions.quiz_id and q.status = 'published'
      )
    )
  );
create policy "admins add questions" on public.questions
  for insert to authenticated with check ((select public.is_admin()));
create policy "admins change questions" on public.questions
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins remove questions" on public.questions
  for delete to authenticated using ((select public.is_admin()));

drop policy if exists "read visible options" on public.options;
drop policy if exists "admins add options" on public.options;
drop policy if exists "admins change options" on public.options;
drop policy if exists "admins remove options" on public.options;
create policy "read visible options" on public.options
  for select to authenticated
  using (
    (select public.is_admin())
    or (
      (select public.is_member())
      and exists (
        select 1
        from public.questions qu
        join public.quizzes q on q.id = qu.quiz_id
        where qu.id = options.question_id and q.status = 'published'
      )
    )
  );
create policy "admins add options" on public.options
  for insert to authenticated with check ((select public.is_admin()));
create policy "admins change options" on public.options
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins remove options" on public.options
  for delete to authenticated using ((select public.is_admin()));

drop policy if exists "read own attempts" on public.attempts;
create policy "read own attempts" on public.attempts
  for select to authenticated
  using (
    (select public.is_admin())
    or ((select public.is_member()) and student_id = (select auth.uid()))
  );

drop policy if exists "read own answers" on public.attempt_answers;
create policy "read own answers" on public.attempt_answers
  for select to authenticated
  using (
    (select public.is_admin())
    or (
      (select public.is_member())
      and exists (
        select 1 from public.attempts a
        where a.id = attempt_answers.attempt_id and a.student_id = (select auth.uid())
      )
    )
  );

drop policy if exists "members read materials" on public.materials;
drop policy if exists "admins add materials" on public.materials;
drop policy if exists "admins change materials" on public.materials;
drop policy if exists "admins remove materials" on public.materials;
create policy "members read materials" on public.materials
  for select to authenticated using ((select public.is_member()));
create policy "admins add materials" on public.materials
  for insert to authenticated with check ((select public.is_admin()));
create policy "admins change materials" on public.materials
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins remove materials" on public.materials
  for delete to authenticated using ((select public.is_admin()));

drop policy if exists "members read courses" on public.courses;
drop policy if exists "admins add courses" on public.courses;
drop policy if exists "admins change courses" on public.courses;
drop policy if exists "admins remove courses" on public.courses;
create policy "members read courses" on public.courses
  for select to authenticated using ((select public.is_member()));
create policy "admins add courses" on public.courses
  for insert to authenticated with check ((select public.is_admin()));
create policy "admins change courses" on public.courses
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins remove courses" on public.courses
  for delete to authenticated using ((select public.is_admin()));

drop policy if exists "members read classes" on public.classes;
drop policy if exists "admins add classes" on public.classes;
drop policy if exists "admins change classes" on public.classes;
drop policy if exists "admins remove classes" on public.classes;
create policy "members read classes" on public.classes
  for select to authenticated using ((select public.is_member()));
create policy "admins add classes" on public.classes
  for insert to authenticated with check ((select public.is_admin()));
create policy "admins change classes" on public.classes
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins remove classes" on public.classes
  for delete to authenticated using ((select public.is_admin()));

drop policy if exists "read own unlimited sessions" on public.unlimited_sessions;
create policy "read own unlimited sessions" on public.unlimited_sessions
  for select to authenticated
  using ((select public.is_member()) and student_id = (select auth.uid()));

drop policy if exists "read own unlimited answers" on public.unlimited_answers;
create policy "read own unlimited answers" on public.unlimited_answers
  for select to authenticated
  using (
    (select public.is_member())
    and exists (
      select 1 from public.unlimited_sessions s
      where s.id = unlimited_answers.session_id and s.student_id = (select auth.uid())
    )
  );

-- 3. Roster changes resync only matching profiles --------------------------

create or replace function public.sync_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rules text[];
  v_rule text;
begin
  if tg_op = 'INSERT' then
    v_rules := array[new.email];
  elsif tg_op = 'UPDATE' and old.email <> new.email then
    v_rules := array[new.email, old.email];
  elsif tg_op = 'UPDATE' then
    v_rules := array[new.email];
  else
    v_rules := array[old.email];
  end if;

  foreach v_rule in array v_rules
  loop
    -- Profiles left with no matching rule keep their row; is_member() already shuts them out.
    update public.profiles p
    set role = m.role,
        class_id = m.class_id
    from (
      select t.id, r.role, r.class_id
      from public.profiles t
      cross join lateral public.roster_match(t.email) r
      where case
        when position('*' in v_rule) = 0 then t.email = v_rule
        else public.email_matches_rule(t.email, v_rule)
      end
    ) m
    where p.id = m.id
      and (p.role is distinct from m.role or p.class_id is distinct from m.class_id);
  end loop;

  return null;
end;
$$;

drop trigger if exists sync_profile_role on public.allowed_emails;
create trigger sync_profile_role
after insert or delete or update of email, role, class_id on public.allowed_emails
for each row execute function public.sync_profile_role();

-- 4. Indexes ----------------------------------------------------------------

create index if not exists quizzes_course_id_idx on public.quizzes (course_id);
create index if not exists quizzes_status_course_idx on public.quizzes (status, course_id);
create index if not exists profiles_class_id_idx on public.profiles (class_id);
create index if not exists allowed_emails_class_id_idx on public.allowed_emails (class_id);
create index if not exists attempts_quiz_submitted_idx
  on public.attempts (quiz_id, submitted_at desc);
create index if not exists attempts_quiz_best_idx
  on public.attempts (quiz_id, student_id, score desc, submitted_at asc);

-- 5. Leaderboard and trending: check membership once, not per row -------------

create or replace function public.unlimited_leaderboard(p_duration integer, p_class_id uuid default null)
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
      and (select public.is_member())
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
    count(a.id) as attempt_count
  from public.quizzes q
  join public.attempts a
    on a.quiz_id = q.id
   and a.submitted_at >= now() - interval '7 days'
  left join public.courses c on c.id = q.course_id
  where q.status = 'published'
    and ((select public.is_admin()) or (select public.is_member()))
  group by q.id, q.title, q.description, c.name, q.created_at
  order by attempt_count desc, q.created_at desc
  limit least(greatest(coalesce(p_limit, 4), 1), 20);
$$;
