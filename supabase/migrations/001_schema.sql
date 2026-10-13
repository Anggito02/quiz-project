-- 001: tables for the FMS quiz app.
-- Run first in the Supabase SQL Editor.

create table public.allowed_emails (
  email text primary key check (email = lower(email) and position('@' in email) > 1),
  role text not null default 'student' check (role in ('admin', 'student')),
  created_at timestamptz not null default now()
);

create or replace function public.normalize_allowed_email()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.email := lower(trim(new.email));
  return new;
end;
$$;

create trigger normalize_allowed_email
before insert or update of email on public.allowed_emails
for each row execute function public.normalize_allowed_email();

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text not null,
  role text not null check (role in ('admin', 'student')),
  created_at timestamptz not null default now()
);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  description text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  prompt text not null check (length(trim(prompt)) > 0),
  type text not null check (type in ('single', 'multi')),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index questions_quiz_position_idx on public.questions (quiz_id, position);

create table public.options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  label text not null check (length(trim(label)) > 0),
  is_correct boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index options_question_position_idx on public.options (question_id, position);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  score integer not null check (score between 0 and 100),
  correct_count integer not null check (correct_count >= 0),
  question_count integer not null check (question_count > 0),
  submitted_at timestamptz not null default now()
);

create index attempts_quiz_student_idx on public.attempts (quiz_id, student_id);
create index attempts_student_idx on public.attempts (student_id, submitted_at desc);

-- Each answer keeps a snapshot of the question and its options at submit time,
-- so later edits or deletes in the quiz builder do not change old reviews.
create table public.attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts (id) on delete cascade,
  question_id uuid references public.questions (id) on delete set null,
  position integer not null,
  question_type text not null check (question_type in ('single', 'multi')),
  prompt_snapshot text not null,
  options_snapshot jsonb not null,
  selected_option_ids uuid[] not null default '{}',
  correct_option_ids uuid[] not null,
  is_correct boolean not null
);

create index attempt_answers_attempt_idx on public.attempt_answers (attempt_id, position);

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  url text not null check (url ~* '^https?://'),
  position integer not null default 0,
  created_at timestamptz not null default now()
);
