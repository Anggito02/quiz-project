-- 002: only emails on public.allowed_emails can create an account,
-- and every new account gets a profile with the role from that list.
-- Run after 001_schema.sql.

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

  if new.email is null
     or not exists (
       select 1 from public.allowed_emails a where a.email = lower(new.email)
     ) then
    raise exception 'This email is not on the class list.';
  end if;
  return new;
end;
$$;

create trigger enforce_allowed_email
before insert or update of email on auth.users
for each row execute function public.enforce_allowed_email();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    lower(new.email),
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(new.email, '@', 1)
    ),
    (select a.role from public.allowed_emails a where a.email = lower(new.email))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.sync_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles p set role = new.role where p.email = new.email;
  return new;
end;
$$;

create trigger sync_profile_role
after update of role on public.allowed_emails
for each row execute function public.sync_profile_role();
