-- Seed the first admin. Replace admin@example.com with your own email,
-- run this in the Supabase SQL Editor after 001-004, then sign up in the app
-- with that same email. Add student emails afterwards from the Roster page.

insert into public.allowed_emails (email, role)
values ('anggito_anju@yahoo.com', 'admin')
on conflict (email) do update set role = excluded.role;
