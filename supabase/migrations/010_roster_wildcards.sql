-- 010: roster wildcards. * matches any text, for example *@corp.gmail.com.
-- An exact email beats a wildcard. Among wildcards, the one with more
-- literal characters wins. Run after 009 in the Supabase SQL Editor.

alter table public.allowed_emails
  drop constraint allowed_emails_email_check;

alter table public.allowed_emails
  add constraint allowed_emails_email_check
  check (
    email = lower(email)
    and email ~ '^[a-z0-9._+*-]+@[a-z0-9.*-]+$'
    and (
      position('*' in email) = 0
      or substring(email from '@(.*)$') ~ '[a-z0-9]'
    )
  );

create or replace function public.email_matches_rule(p_email text, p_rule text)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_rule text := lower(trim(coalesce(p_rule, '')));
  v_like text := '';
  i integer;
  ch text;
begin
  if v_email = '' or v_rule = '' then
    return false;
  end if;

  if position('*' in v_rule) = 0 then
    return v_email = v_rule;
  end if;

  for i in 1..char_length(v_rule) loop
    ch := substr(v_rule, i, 1);
    if ch = '*' then
      v_like := v_like || '%';
    elsif ch in ('%', '_', '\') then
      v_like := v_like || '\' || ch;
    else
      v_like := v_like || ch;
    end if;
  end loop;

  return v_email like v_like escape '\';
end;
$$;

create or replace function public.roster_match(p_email text)
returns table (role text, class_id uuid, rule text)
language sql
stable
security definer
set search_path = ''
as $$
  select a.role, a.class_id, a.email
  from public.allowed_emails a
  where public.email_matches_rule(p_email, a.email)
  order by
    (position('*' in a.email) = 0) desc,
    char_length(replace(a.email, '*', '')) desc,
    a.created_at asc
  limit 1;
$$;

create or replace function public.roster_role(p_email text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select m.role from public.roster_match(p_email) m;
$$;

revoke execute on function public.email_matches_rule(text, text) from public, anon, authenticated;
revoke execute on function public.roster_match(text) from public, anon, authenticated;
revoke execute on function public.roster_role(text) from public, anon, authenticated;
grant execute on function public.email_matches_rule(text, text) to postgres;
grant execute on function public.roster_match(text) to postgres;
grant execute on function public.roster_role(text) to postgres;

create or replace function public.is_email_allowed(p_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.roster_role(p_email) is not null;
$$;

create or replace function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.roster_role(
    (select p.email from public.profiles p where p.id = auth.uid())
  ) is not null;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.roster_role(
    (select p.email from public.profiles p where p.id = auth.uid())
  ) = 'admin';
$$;

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
  v_class uuid;
begin
  select m.role, m.class_id into v_role, v_class
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
    v_class
  );
  return new;
end;
$$;

create or replace function public.sync_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles p
  set role = m.role,
      class_id = m.class_id
  from (
    select t.id, r.role, r.class_id
    from public.profiles t
    cross join lateral public.roster_match(t.email) r
    where r.rule = new.email
  ) m
  where p.id = m.id;
  return new;
end;
$$;

drop trigger if exists sync_profile_role on public.allowed_emails;
create trigger sync_profile_role
after insert or update of role, class_id on public.allowed_emails
for each row execute function public.sync_profile_role();

-- Student checks inside submit_attempt and start_unlimited_session still
-- compare the account to an exact allowlist row. Point them at roster_role.
do $patch$
declare
  fn regprocedure;
  def text;
  patched text;
begin
  foreach fn in array array[
    'public.submit_attempt(uuid,jsonb)'::regprocedure,
    'public.start_unlimited_session(uuid[],integer)'::regprocedure
  ]
  loop
    def := pg_get_functiondef(fn);
    patched := regexp_replace(
      def,
      'join public\.allowed_emails a on a\.email = p\.email[[:space:]]+where p\.id = v_student and a\.role = ''student''',
      'where public.roster_role(p.email) = ''student'''
    );
    if patched = def then
      raise exception 'Could not patch the student check in %', fn::text;
    end if;
    execute patched;
  end loop;
end
$patch$;
