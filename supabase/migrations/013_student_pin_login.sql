-- 013: students log in with name + PIN. Admins keep email and password.
-- Run after 012 in the Supabase SQL Editor.

alter table public.profiles
  add column if not exists student_number text;

create unique index if not exists profiles_student_number_idx
  on public.profiles (student_number)
  where student_number is not null;

create or replace function public.is_student_email(p_email text)
returns boolean
language sql
immutable
parallel safe
set search_path = ''
as $$
  select lower(trim(coalesce(p_email, ''))) ~ '^serdik\.[0-9]+@students\.local$';
$$;

create or replace function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p where p.id = auth.uid()
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
    where p.id = auth.uid()
      and p.role = 'admin'
      and a.role = 'admin'
  );
$$;

create or replace function public.list_class_students(p_class_id uuid)
returns table (id uuid, display_name text, student_number text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.display_name, p.student_number
  from public.profiles p
  where p.role = 'student'
    and p.class_id = p_class_id
    and p.student_number is not null
  order by lower(p.display_name), p.student_number;
$$;

revoke execute on function public.list_class_students(uuid) from public;
grant execute on function public.list_class_students(uuid) to anon, authenticated;

create or replace function public.enforce_allowed_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.email is not distinct from old.email then
    return new;
  end if;

  if public.is_student_email(new.email) then
    return new;
  end if;

  if public.roster_role(new.email) is null then
    raise exception 'This email is not on the class list.';
  end if;
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text;
  v_roster_class uuid;
  v_number text := nullif(trim(new.raw_user_meta_data ->> 'student_number'), '');
  v_selected_class uuid;
begin
  if public.is_student_email(new.email) then
    if v_number is null or v_number !~ '^[0-9]+$' then
      raise exception 'Student number is required.';
    end if;

    if coalesce(new.raw_user_meta_data ->> 'class_id', '') ~
         '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'
    then
      select c.id into v_selected_class
      from public.classes c
      where c.id = (new.raw_user_meta_data ->> 'class_id')::uuid;
    end if;

    insert into public.profiles (id, email, display_name, role, class_id, student_number)
    values (
      new.id,
      lower(new.email),
      coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
        'Student ' || v_number
      ),
      'student',
      v_selected_class,
      v_number
    );
    return new;
  end if;

  select m.role, m.class_id into v_role, v_roster_class
  from public.roster_match(new.email) m;

  if v_role is null then
    raise exception 'This email is not on the class list.';
  end if;

  insert into public.profiles (id, email, display_name, role, class_id)
  values (
    new.id,
    lower(new.email),
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(new.email, '@', 1)
    ),
    v_role,
    v_roster_class
  );
  return new;
end;
$$;

create or replace function public.patch_student_role_check(fn regprocedure)
returns void
language plpgsql
set search_path = ''
as $$
declare
  def text := pg_get_functiondef(fn);
  patched text;
begin
  -- Already rewritten by a previous run of this migration.
  if position('p.role = ''student''' in def) > 0
     and position('roster_role(p.email)' in def) = 0
     and position('join public.allowed_emails' in def) = 0 then
    return;
  end if;

  patched := regexp_replace(
    def,
    'from public\.profiles p[[:space:]]+where public\.roster_role\(p\.email\) = ''student''',
    $q$from public.profiles p
    where p.id = v_student and p.role = 'student'$q$
  );
  if patched = def then
    patched := regexp_replace(
      def,
      'from public\.profiles p[[:space:]]+join public\.allowed_emails a on a\.email = p\.email[[:space:]]+where p\.id = v_student and a\.role = ''student''',
      $q$from public.profiles p
    where p.id = v_student and p.role = 'student'$q$
    );
  end if;
  if patched = def then
    raise exception 'Could not patch the student check in %', fn::text;
  end if;
  execute patched;
end;
$$;

select public.patch_student_role_check('public.submit_attempt(uuid,jsonb)'::regprocedure);
select public.patch_student_role_check('public.start_unlimited_session(uuid[],integer)'::regprocedure);
drop function public.patch_student_role_check(regprocedure);

delete from public.unlimited_answers;
delete from public.unlimited_sessions;
delete from public.attempt_answers;
delete from public.attempts;
