-- 003: Row Level Security.
-- A "member" is a signed-in user whose email is still on public.allowed_emails.
-- The allowlist role is the source of truth for admin rights.
-- Run after 002_auth_triggers.sql.

create or replace function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    join public.allowed_emails a on a.email = p.email
    where p.id = auth.uid()
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    join public.allowed_emails a on a.email = p.email
    where p.id = auth.uid() and a.role = 'admin'
  );
$$;

revoke execute on function public.is_member() from public, anon;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_member() to authenticated;
grant execute on function public.is_admin() to authenticated;

alter table public.allowed_emails enable row level security;
alter table public.profiles enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.options enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_answers enable row level security;
alter table public.materials enable row level security;

-- allowed_emails: admins only. Sign-up checks go through is_email_allowed() in 004.
create policy "admins read allowlist" on public.allowed_emails
  for select to authenticated using (public.is_admin());
create policy "admins add allowlist" on public.allowed_emails
  for insert to authenticated with check (public.is_admin());
create policy "admins change allowlist" on public.allowed_emails
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins remove allowlist" on public.allowed_emails
  for delete to authenticated using (public.is_admin());

-- profiles: members can read names for the leaderboard. Rows are created by the
-- auth trigger and roles follow the allowlist, so nobody writes them directly.
create policy "members read profiles" on public.profiles
  for select to authenticated using (public.is_member());
create policy "admins rename profiles" on public.profiles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- quizzes: students see published ones, admins see and manage all.
create policy "read visible quizzes" on public.quizzes
  for select to authenticated
  using (public.is_admin() or (public.is_member() and status = 'published'));
create policy "admins add quizzes" on public.quizzes
  for insert to authenticated with check (public.is_admin());
create policy "admins change quizzes" on public.quizzes
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins remove quizzes" on public.quizzes
  for delete to authenticated using (public.is_admin());

create policy "read visible questions" on public.questions
  for select to authenticated
  using (
    public.is_admin()
    or (
      public.is_member()
      and exists (
        select 1 from public.quizzes q
        where q.id = questions.quiz_id and q.status = 'published'
      )
    )
  );
create policy "admins add questions" on public.questions
  for insert to authenticated with check (public.is_admin());
create policy "admins change questions" on public.questions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins remove questions" on public.questions
  for delete to authenticated using (public.is_admin());

create policy "read visible options" on public.options
  for select to authenticated
  using (
    public.is_admin()
    or (
      public.is_member()
      and exists (
        select 1
        from public.questions qu
        join public.quizzes q on q.id = qu.quiz_id
        where qu.id = options.question_id and q.status = 'published'
      )
    )
  );
create policy "admins add options" on public.options
  for insert to authenticated with check (public.is_admin());
create policy "admins change options" on public.options
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins remove options" on public.options
  for delete to authenticated using (public.is_admin());

-- attempts: read-only from the client. submit_attempt() in 004 is the only writer.
create policy "read own attempts" on public.attempts
  for select to authenticated
  using (public.is_admin() or (public.is_member() and student_id = auth.uid()));

create policy "read own answers" on public.attempt_answers
  for select to authenticated
  using (
    public.is_admin()
    or (
      public.is_member()
      and exists (
        select 1 from public.attempts a
        where a.id = attempt_answers.attempt_id and a.student_id = auth.uid()
      )
    )
  );

revoke insert, update, delete on public.attempts from anon, authenticated;
revoke insert, update, delete on public.attempt_answers from anon, authenticated;

create policy "members read materials" on public.materials
  for select to authenticated using (public.is_member());
create policy "admins add materials" on public.materials
  for insert to authenticated with check (public.is_admin());
create policy "admins change materials" on public.materials
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins remove materials" on public.materials
  for delete to authenticated using (public.is_admin());
