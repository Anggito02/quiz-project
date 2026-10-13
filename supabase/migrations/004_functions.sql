-- 004: sign-up email check, server-side grading, and the per-quiz leaderboard.
-- Run after 003_rls.sql.

-- Lets the sign-up form refuse an unlisted email with a clear message before
-- calling Supabase Auth. The auth.users trigger in 002 enforces the same rule.
create or replace function public.is_email_allowed(p_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.allowed_emails a where a.email = lower(trim(p_email))
  );
$$;

revoke execute on function public.is_email_allowed(text) from public;
grant execute on function public.is_email_allowed(text) to anon, authenticated;

-- p_answers is a JSON object: { "<question_id>": ["<option_id>", ...], ... }.
-- The score is computed here; nothing the browser sends can set it.
-- A question is correct only when the selected set equals the correct set.
create or replace function public.submit_attempt(p_quiz_id uuid, p_answers jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student uuid := auth.uid();
  v_answers jsonb := coalesce(p_answers, '{}'::jsonb);
  v_attempt uuid;
  v_total integer;
  v_correct integer := 0;
  v_raw jsonb;
  v_selected uuid[];
  v_correct_ids uuid[];
  v_options jsonb;
  v_is_correct boolean;
  q record;
begin
  if v_student is null then
    raise exception 'You must be signed in to submit a quiz.';
  end if;

  if not exists (
    select 1
    from public.profiles p
    join public.allowed_emails a on a.email = p.email
    where p.id = v_student and a.role = 'student'
  ) then
    raise exception 'Only students on the class list can submit quizzes.';
  end if;

  if not exists (
    select 1 from public.quizzes where id = p_quiz_id and status = 'published'
  ) then
    raise exception 'This quiz is not open.';
  end if;

  if jsonb_typeof(v_answers) <> 'object' then
    raise exception 'Answers must be a JSON object.';
  end if;

  select count(*) into v_total from public.questions where quiz_id = p_quiz_id;
  if v_total = 0 then
    raise exception 'This quiz has no questions.';
  end if;

  insert into public.attempts (quiz_id, student_id, score, correct_count, question_count)
  values (p_quiz_id, v_student, 0, 0, v_total)
  returning id into v_attempt;

  for q in
    select qu.id, qu.prompt, qu.type, row_number() over (order by qu.position, qu.created_at) as pos
    from public.questions qu
    where qu.quiz_id = p_quiz_id
    order by qu.position, qu.created_at
  loop
    v_raw := v_answers -> q.id::text;
    if v_raw is null or jsonb_typeof(v_raw) <> 'array' then
      v_raw := '[]'::jsonb;
    end if;

    select coalesce(array_agg(o.id), '{}')
    into v_selected
    from public.options o
    where o.question_id = q.id
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
    where o.question_id = q.id;

    v_is_correct := cardinality(v_correct_ids) > 0
      and v_selected @> v_correct_ids
      and v_correct_ids @> v_selected;

    if v_is_correct then
      v_correct := v_correct + 1;
    end if;

    insert into public.attempt_answers (
      attempt_id, question_id, position, question_type, prompt_snapshot,
      options_snapshot, selected_option_ids, correct_option_ids, is_correct
    )
    values (
      v_attempt, q.id, q.pos, q.type, q.prompt,
      v_options, v_selected, v_correct_ids, v_is_correct
    );
  end loop;

  update public.attempts
  set score = round(v_correct * 100.0 / v_total),
      correct_count = v_correct
  where id = v_attempt;

  return v_attempt;
end;
$$;

revoke execute on function public.submit_attempt(uuid, jsonb) from public, anon;
grant execute on function public.submit_attempt(uuid, jsonb) to authenticated;

-- One row per student who has submitted the quiz. The counting attempt is the
-- highest score; among equal scores, the earliest submit time. Rank order is
-- score descending, then submit time ascending, then display name A to Z.
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
  order by rank;
$$;

revoke execute on function public.quiz_leaderboard(uuid) from public, anon;
grant execute on function public.quiz_leaderboard(uuid) to authenticated;
