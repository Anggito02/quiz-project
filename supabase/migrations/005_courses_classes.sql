-- 005: course labels for quizzes and class labels for people.
-- Run after 001-004 in the Supabase SQL Editor.

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now()
);

create unique index courses_name_lower_idx on public.courses (lower(name));

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now()
);

create unique index classes_name_lower_idx on public.classes (lower(name));

alter table public.quizzes
  add column course_id uuid references public.courses (id) on delete restrict;

alter table public.allowed_emails
  add column class_id uuid references public.classes (id) on delete restrict;

alter table public.profiles
  add column class_id uuid references public.classes (id) on delete restrict;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name, role, class_id)
  values (
    new.id,
    lower(new.email),
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(new.email, '@', 1)
    ),
    (select a.role from public.allowed_emails a where a.email = lower(new.email)),
    (select a.class_id from public.allowed_emails a where a.email = lower(new.email))
  );
  return new;
end;
$$;

alter table public.courses enable row level security;
alter table public.classes enable row level security;

create policy "members read courses" on public.courses
  for select to authenticated using (public.is_member());
create policy "admins add courses" on public.courses
  for insert to authenticated with check (public.is_admin());
create policy "admins change courses" on public.courses
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins remove courses" on public.courses
  for delete to authenticated using (public.is_admin());

create policy "members read classes" on public.classes
  for select to authenticated using (public.is_member());
create policy "admins add classes" on public.classes
  for insert to authenticated with check (public.is_admin());
create policy "admins change classes" on public.classes
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins remove classes" on public.classes
  for delete to authenticated using (public.is_admin());

grant select, insert, update, delete on public.courses to authenticated;
grant select, insert, update, delete on public.classes to authenticated;
