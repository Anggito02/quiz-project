import ExcelJS from "exceljs";
import { writeFileSync } from "fs";

function cellText(cell) {
  return String(cell.text ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function pinFromCell(cell) {
  const value = cell.value;
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.trunc(value)).padStart(6, "0");
  }
  const text = cellText(cell).replace(/\s+/g, "");
  if (/^\d{1,6}$/.test(text)) return text.padStart(6, "0");
  return text;
}

function numberFromCell(cell) {
  const value = cell.value;
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }
  return cellText(cell);
}

function normalizeClassName(value) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  const match = trimmed.match(/^kelas\s+(.+)$/i);
  return match ? match[1].trim() : trimmed;
}

function sqlStr(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile("data/data-serdik-kelas.xlsx");

const rows = [];
for (const sheet of workbook.worksheets) {
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const studentNumber = numberFromCell(row.getCell(1));
    const name = cellText(row.getCell(2));
    const className = normalizeClassName(cellText(row.getCell(3)));
    const pin = pinFromCell(row.getCell(4));
    if (!studentNumber && !name) return;
    if (!/^[0-9]+$/.test(studentNumber)) {
      throw new Error(`Bad student number ${studentNumber}`);
    }
    if (!/^\d{6}$/.test(pin)) {
      throw new Error(`Bad PIN for ${name}`);
    }
    rows.push({ studentNumber, name, className, pin });
  });
}

rows.sort((a, b) => Number(a.studentNumber) - Number(b.studentNumber));
const classes = [...new Set(rows.map((row) => row.className))].sort();

const classValues = classes.map((name) => `  (${sqlStr(name)})`).join(",\n");
const seedValues = rows
  .map(
    (row) =>
      `  (${sqlStr(row.studentNumber)}, ${sqlStr(row.name)}, ${sqlStr(row.className)}, ${sqlStr(row.pin)})`,
  )
  .join(",\n");

const sql = `-- 014: seed all serdik from data/data-serdik-kelas.xlsx into Auth + profiles.
-- Run after 013 in the Supabase SQL Editor.
-- Students log in with name + PIN. Behind the scenes each account uses
-- email serdik.{nomor}@students.local and password Serdik-{PIN}!
-- This file contains plaintext PINs. Keep it private; prefer deleting or
-- rotating after a successful seed if the repo is shared.

create extension if not exists pgcrypto;

insert into public.classes (name)
select c.name
from (values
${classValues}
) as c(name)
where not exists (
  select 1 from public.classes existing
  where lower(existing.name) = lower(c.name)
);

do $seed$
declare
  r record;
  v_user uuid;
  v_class uuid;
  v_email text;
  v_password text;
begin
  create temporary table serdik_seed (
    student_number text primary key,
    display_name text not null,
    class_name text not null,
    pin text not null
  ) on commit drop;

  insert into serdik_seed (student_number, display_name, class_name, pin) values
${seedValues};

  for r in
    select * from serdik_seed order by student_number::integer
  loop
    v_email := 'serdik.' || r.student_number || '@students.local';
    v_password := 'Serdik-' || r.pin || '!';

    select c.id into v_class
    from public.classes c
    where lower(c.name) = lower(r.class_name);

    if v_class is null then
      raise exception 'Missing class % for student %', r.class_name, r.student_number;
    end if;

    select u.id into v_user
    from auth.users u
    where lower(u.email) = v_email;

    if v_user is null then
      v_user := gen_random_uuid();

      insert into auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
      ) values (
        '00000000-0000-0000-0000-000000000000',
        v_user,
        'authenticated',
        'authenticated',
        v_email,
        crypt(v_password, gen_salt('bf')),
        now(),
        jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
        jsonb_build_object(
          'display_name', r.display_name,
          'student_number', r.student_number,
          'class_id', v_class::text
        ),
        now(),
        now(),
        '',
        '',
        '',
        ''
      );

      insert into auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) values (
        gen_random_uuid(),
        v_user,
        jsonb_build_object('sub', v_user::text, 'email', v_email),
        'email',
        v_user::text,
        now(),
        now(),
        now()
      );
    else
      update auth.users
      set encrypted_password = crypt(v_password, gen_salt('bf')),
          email_confirmed_at = coalesce(email_confirmed_at, now()),
          raw_user_meta_data = jsonb_build_object(
            'display_name', r.display_name,
            'student_number', r.student_number,
            'class_id', v_class::text
          ),
          updated_at = now()
      where id = v_user;
    end if;

    insert into public.profiles (id, email, display_name, role, class_id, student_number)
    values (v_user, v_email, r.display_name, 'student', v_class, r.student_number)
    on conflict (id) do update
    set display_name = excluded.display_name,
        role = excluded.role,
        class_id = excluded.class_id,
        student_number = excluded.student_number,
        email = excluded.email;
  end loop;
end
$seed$;
`;

writeFileSync("supabase/migrations/014_seed_serdik.sql", sql);
console.log(
  JSON.stringify(
    {
      students: rows.length,
      classes,
      output: "supabase/migrations/014_seed_serdik.sql",
    },
    null,
    2,
  ),
);
