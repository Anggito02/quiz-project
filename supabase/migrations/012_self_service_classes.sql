-- 012: let students admitted by wildcard roster rules choose their own class.
-- Exact roster entries remain controlled by the administrator.
-- Run after 011 in the Supabase SQL Editor.

create or replace function public.signup_classes()
returns table (id uuid, name text)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id, c.name
  from public.classes c
  order by lower(c.name), c.id;
$$;

revoke execute on function public.signup_classes() from public;
grant execute on function public.signup_classes() to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text;
  v_roster_class uuid;
  v_rule text;
  v_selected_class uuid;
begin
  select m.role, m.class_id, m.rule
  into v_role, v_roster_class, v_rule
  from public.roster_match(new.email) m;

  if v_role is null then
    raise exception 'This email is not on the class list.';
  end if;

  -- Metadata is untrusted. Only accept a class that already exists.
  if coalesce(new.raw_user_meta_data ->> 'class_id', '') ~
       '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'
  then
    select c.id into v_selected_class
    from public.classes c
    where c.id = (new.raw_user_meta_data ->> 'class_id')::uuid;
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
    coalesce(v_selected_class, v_roster_class)
  );
  return new;
end;
$$;

create or replace function public.can_choose_own_class()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select m.role = 'student' and position('*' in m.rule) > 0
    from public.profiles p
    cross join lateral public.roster_match(p.email) m
    where p.id = auth.uid()
  ), false);
$$;

revoke execute on function public.can_choose_own_class() from public, anon;
grant execute on function public.can_choose_own_class() to authenticated;

create or replace function public.update_own_class(p_class_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  if not public.can_choose_own_class() then
    raise exception 'Your class is managed by the administrator.';
  end if;

  if not exists (select 1 from public.classes c where c.id = p_class_id) then
    raise exception 'Choose a valid class.';
  end if;

  update public.profiles
  set class_id = p_class_id
  where id = auth.uid();
end;
$$;

revoke execute on function public.update_own_class(uuid) from public, anon;
grant execute on function public.update_own_class(uuid) to authenticated;

-- Wildcard class values are defaults. Do not overwrite a class subsequently
-- chosen by a student. Exact roster entries remain administrator-controlled.
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
    update public.profiles p
    set role = m.role,
        class_id = case
          when position('*' in m.rule) = 0 then m.class_id
          else coalesce(p.class_id, m.class_id)
        end
    from (
      select t.id, r.role, r.class_id, r.rule
      from public.profiles t
      cross join lateral public.roster_match(t.email) r
      where case
        when position('*' in v_rule) = 0 then t.email = v_rule
        else public.email_matches_rule(t.email, v_rule)
      end
    ) m
    where p.id = m.id
      and (
        p.role is distinct from m.role
        or (
          position('*' in m.rule) = 0
          and p.class_id is distinct from m.class_id
        )
        or (
          position('*' in m.rule) > 0
          and p.class_id is null
          and m.class_id is not null
        )
      );
  end loop;

  return null;
end;
$$;
