"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MAX_SERDIK_BYTES, parseSerdikWorkbook } from "@/lib/serdik-excel";
import { studentEmail, studentPassword } from "@/lib/serdik";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type RosterState = {
  error?: string;
  notice?: string;
};

async function adminClient() {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/");
  return supabase;
}

const EXACT_EMAIL = /^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

function rosterEntry(value: FormDataEntryValue | null) {
  const email = String(value ?? "").trim().toLowerCase();
  if (!EXACT_EMAIL.test(email)) {
    return { error: "Enter a valid admin email." };
  }
  return { email };
}

export async function addEmail(_state: RosterState, formData: FormData): Promise<RosterState> {
  const parsed = rosterEntry(formData.get("email"));
  if ("error" in parsed) return { error: parsed.error };
  const email = parsed.email;

  const supabase = await adminClient();
  const { error } = await supabase.from("allowed_emails").insert({ email, role: "admin" });

  if (error) {
    if (error.code === "23505") return { error: "That email is already on the list." };
    return { error: "Could not add that admin email." };
  }

  revalidatePath("/admin/roster");
  return {};
}

export async function importStudents(
  _state: RosterState,
  formData: FormData,
): Promise<RosterState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an Excel file." };
  if (!file.name.toLowerCase().endsWith(".xlsx")) return { error: "Upload an .xlsx file." };
  if (file.size > MAX_SERDIK_BYTES) return { error: "That file is larger than 2 MB." };

  const supabase = await adminClient();
  const parsed = await parseSerdikWorkbook(Buffer.from(await file.arrayBuffer()));
  if ("error" in parsed) return { error: parsed.error };

  let admin;
  try {
    admin = createAdminClient();
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Missing service role key." };
  }

  const classIds = new Map<string, string>();
  const { data: existingClasses } = await supabase.from("classes").select("id, name");
  for (const row of existingClasses ?? []) {
    classIds.set(row.name.toLowerCase(), row.id);
  }

  for (const className of [...new Set(parsed.rows.map((row) => row.className))]) {
    const key = className.toLowerCase();
    if (classIds.has(key)) continue;
    const { data, error } = await supabase.from("classes").insert({ name: className }).select("id").single();
    if (error || !data) return { error: `Could not add class ${className}.` };
    classIds.set(key, data.id);
  }

  const usersByEmail = new Map<string, string>();
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return { error: "Could not read existing accounts." };
    for (const user of data.users ?? []) {
      if (user.email) usersByEmail.set(user.email.toLowerCase(), user.id);
    }
    if ((data.users ?? []).length < 1000) break;
    page += 1;
  }

  let created = 0;
  let updated = 0;
  const failures: string[] = [];

  for (const row of parsed.rows) {
    const email = studentEmail(row.studentNumber);
    const classId = classIds.get(row.className.toLowerCase());
    const metadata = {
      display_name: row.name,
      class_id: classId,
      student_number: row.studentNumber,
    };
    const password = studentPassword(row.pin);
    const existingId = usersByEmail.get(email);
    let userId = existingId;

    if (existingId) {
      const { error } = await admin.auth.admin.updateUserById(existingId, {
        password,
        email_confirm: true,
        user_metadata: metadata,
      });
      if (error) {
        failures.push(`${row.name}: ${error.message}`);
        continue;
      }
      updated += 1;
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: metadata,
      });
      if (error || !data.user) {
        failures.push(`${row.name}: ${error?.message ?? "could not create account"}`);
        continue;
      }
      userId = data.user.id;
      created += 1;
    }

    if (!userId || !classId) continue;
    const { error: profileError } = await admin
      .from("profiles")
      .update({
        display_name: row.name,
        role: "student",
        class_id: classId,
        student_number: row.studentNumber,
      })
      .eq("id", userId);
    if (profileError) failures.push(`${row.name}: ${profileError.message}`);
  }

  revalidatePath("/admin/roster");
  revalidatePath("/admin/classes");
  revalidatePath("/login");

  if (failures.length > 0) {
    return {
      error: `Imported ${created + updated} students, but ${failures.length} failed.\n${failures.slice(0, 8).join("\n")}`,
    };
  }

  return { notice: `Imported ${parsed.rows.length} students (${created} new, ${updated} updated).` };
}

export async function removeEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return;

  const supabase = await adminClient();
  await supabase.from("allowed_emails").delete().eq("email", email);
  revalidatePath("/admin/roster");
}
