-- 006: cap every leaderboard at 100 rows, and store timed unlimited runs.
-- Run after 005 in the Supabase SQL Editor. Do not edit 001-005.

create or replace function public.quiz_leaderboard(p_quiz_id uuid)
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
  order by rank
  limit 100;
$$;

create table public.unlimited_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  duration_minutes integer not null check (duration_minutes in (5, 10, 20)),
  course_ids uuid[] not null check (cardinality(course_ids) > 0),
  question_ids uuid[] not null,
  correct_count integer not null default 0 check (correct_count >= 0),
  question_count integer not null default 0 check (question_count >= 0),
  started_at timestamptz not null default now(),
  ends_at timestamptz not null,
  submitted_at timestamptz
);

create index unlimited_sessions_student_idx
  on public.unlimited_sessions (student_id, submitted_at desc);
create index unlimited_sessions_board_idx
  on public.unlimited_sessions (duration_minutes, correct_count desc, submitted_at asc);

create table public.unlimited_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.unlimited_sessions (id) on delete cascade,
  question_id uuid references public.questions (id) on delete set null,
  position integer not null,
  question_type text not null check (question_type in ('single', 'multi')),
  prompt_snapshot text not null,
  options_snapshot jsonb not null,
  selected_option_ids uuid[] not null default '{}',
  correct_option_ids uuid[] not null,
  is_correct boolean not null
);

create index unlimited_answers_session_idx
  on public.unlimited_answers (session_id, position);

alter table public.unlimited_sessions enable row level security;
alter table public.unlimited_answers enable row level security;

create policy "read own unlimited sessions" on public.unlimited_sessions
  for select to authenticated
  using (public.is_member() and student_id = auth.uid());

create policy "read own unlimited answers" on public.unlimited_answers
  for select to authenticated
  using (
    public.is_member()
    and exists (
      select 1 from public.unlimited_sessions s
      where s.id = unlimited_answers.session_id and s.student_id = auth.uid()
    )
  );

revoke insert, update, delete on public.unlimited_sessions from anon, authenticated;
revoke insert, update, delete on public.unlimited_answers from anon, authenticated;
grant select on public.unlimited_sessions to authenticated;
grant select on public.unlimited_answers to authenticated;

create or replace function public.start_unlimited_session(
  p_course_ids uuid[],
  p_duration integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student uuid := auth.uid();
  v_ids uuid[];
  v_session uuid;
begin
  if v_student is null then
    raise exception 'You must be signed in.';
  end if;

  if not exists (
    select 1
    from public.profiles p
    join public.allowed_emails a on a.email = p.email
    where p.id = v_student and a.role = 'student'
  ) then
    raise exception 'Only students on the class list can start a timed quiz.';
  end if;

  if p_duration not in (5, 10, 20) then
    raise exception 'Choose 5, 10, or 20 minutes.';
  end if;

  if p_course_ids is null or cardinality(p_course_ids) = 0 then
    raise exception 'Choose at least one course.';
  end if;

  select coalesce(array_agg(qu.id order by random()), '{}')
  into v_ids
  from public.questions qu
  join public.quizzes q on q.id = qu.quiz_id
  where q.status = 'published'
    and q.course_id = any (p_course_ids);

  if cardinality(v_ids) = 0 then
    raise exception 'Those courses have no published questions.';
  end if;

  insert into public.unlimited_sessions (
    student_id, duration_minutes, course_ids, question_ids, ends_at
  )
  values (
    v_student,
    p_duration,
    p_course_ids,
    v_ids,
    now() + make_interval(mins => p_duration)
  )
  returning id into v_session;

  return v_session;
end;
$$;

create or replace function public.submit_unlimited_session(
  p_session_id uuid,
  p_answers jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student uuid := auth.uid();
  v_session public.unlimited_sessions%rowtype;
  v_answers jsonb := coalesce(p_answers, '{}'::jsonb);
  v_correct integer := 0;
  v_seen integer := 0;
  v_question uuid;
  v_raw jsonb;
  v_selected uuid[];
  v_correct_ids uuid[];
  v_options jsonb;
  v_is_correct boolean;
  v_prompt text;
  v_type text;
  v_pos integer := 0;
begin
  if v_student is null then
    raise exception 'You must be signed in.';
  end if;

  if jsonb_typeof(v_answers) <> 'object' then
    raise exception 'Answers must be a JSON object.';
  end if;

  select * into v_session
  from public.unlimited_sessions
  where id = p_session_id and student_id = v_student
  for update;

  if not found then
    raise exception 'That timed quiz was not found.';
  end if;

  if v_session.submitted_at is not null then
    return v_session.id;
  end if;

  if now() > v_session.ends_at + interval '30 seconds' then
    raise exception 'That timed quiz has already ended.';
  end if;

  foreach v_question in array v_session.question_ids
  loop
    if not (v_answers ? v_question::text) then
      continue;
    end if;

    v_pos := v_pos + 1;
    v_seen := v_seen + 1;
    v_raw := v_answers -> v_question::text;
    if v_raw is null or jsonb_typeof(v_raw) <> 'array' then
      v_raw := '[]'::jsonb;
    end if;

    select qu.prompt, qu.type
    into v_prompt, v_type
    from public.questions qu
    where qu.id = v_question;

    if v_prompt is null then
      continue;
    end if;

    select coalesce(array_agg(o.id), '{}')
    into v_selected
    from public.options o
    where o.question_id = v_question
      and o.id::text in (select jsonb_array_elements_text(v_raw));

    select
      coalesce(array_agg(o.id order by o.position, o.created_at) filter (where o.is_correct), '{}'),
      coalesce(
        jsonb_agg(
          jsonb_build_object('id', o.id, 'label', o.label, 'is_correct', o.is_correct)
          order by o.position, o.created_at
        ),
        '[]'::jsonb
      )
    into v_correct_ids, v_options
    from public.options o
    where o.question_id = v_question;

    v_is_correct := cardinality(v_correct_ids) > 0
      and v_selected @> v_correct_ids
      and v_correct_ids @> v_selected;

    if v_is_correct then
      v_correct := v_correct + 1;
    end if;

    insert into public.unlimited_answers (
      session_id, question_id, position, question_type, prompt_snapshot,
      options_snapshot, selected_option_ids, correct_option_ids, is_correct
    )
    values (
      v_session.id, v_question, v_pos, v_type, v_prompt,
      v_options, v_selected, v_correct_ids, v_is_correct
    );
  end loop;

  update public.unlimited_sessions
  set correct_count = v_correct,
      question_count = v_seen,
      submitted_at = now()
  where id = v_session.id;

  return v_session.id;
end;
$$;

create or replace function public.unlimited_leaderboard(p_duration integer)
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
  order by rank
  limit 100;
$$;

revoke execute on function public.start_unlimited_session(uuid[], integer) from public, anon;
revoke execute on function public.submit_unlimited_session(uuid, jsonb) from public, anon;
revoke execute on function public.unlimited_leaderboard(integer) from public, anon;
grant execute on function public.start_unlimited_session(uuid[], integer) to authenticated;
grant execute on function public.submit_unlimited_session(uuid, jsonb) to authenticated;
grant execute on function public.unlimited_leaderboard(integer) to authenticated;
