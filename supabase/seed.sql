-- Seed the first admin. Replace the email if needed, run this in the
-- Supabase SQL Editor after the schema migrations, then log in with that
-- email. Import students from Roster using the class Excel file.

insert into public.allowed_emails (email, role)
values ('anggito_anju@yahoo.com', 'admin')
on conflict (email) do update set role = excluded.role;
