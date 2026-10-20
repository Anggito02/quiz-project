"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type RosterState = {
  error?: string;
};

async function adminClient() {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/");
  return supabase;
}

const EXACT_EMAIL = /^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
const ROSTER_RULE = /^[a-z0-9._+*-]+@[a-z0-9.*-]+$/;

function roleFromForm(value: FormDataEntryValue | null) {
  const role = String(value ?? "");
  if (role === "admin" || role === "student") return role;
  return null;
}

function rosterEntry(value: FormDataEntryValue | null) {
  const email = String(value ?? "").trim().toLowerCase();
  if (!email.includes("@") || email.split("@").length !== 2) {
    return { error: "Enter an email or a rule like *@corp.gmail.com." };
  }

  if (email.includes("*")) {
    const domain = email.slice(email.indexOf("@") + 1);
    if (!ROSTER_RULE.test(email) || !/[a-z0-9]/.test(domain)) {
      return { error: "Use a rule like *@corp.gmail.com. The * matches any text." };
    }
    return { email };
  }

  if (!EXACT_EMAIL.test(email)) {
    return { error: "Enter a valid email or a rule like *@corp.gmail.com." };
  }
  return { email };
}

async function classIdFromForm(
  supabase: Awaited<ReturnType<typeof adminClient>>,
  value: FormDataEntryValue | null,
) {
  const classId = String(value ?? "").trim();
  if (!classId) return { classId: null as string | null };
  const { data } = await supabase.from("classes").select("id").eq("id", classId).maybeSingle();
  if (!data) return { error: "Choose a class." };
  return { classId };
}

export async function addEmail(_state: RosterState, formData: FormData): Promise<RosterState> {
  const parsed = rosterEntry(formData.get("email"));
  const role = roleFromForm(formData.get("role"));

  if ("error" in parsed || !role) {
    return { error: "error" in parsed ? parsed.error : "Enter a valid email and role." };
  }
  const email = parsed.email;

  const supabase = await adminClient();
  const chosenClass = await classIdFromForm(supabase, formData.get("classId"));
  if ("error" in chosenClass) return { error: chosenClass.error };

  const { error } = await supabase
    .from("allowed_emails")
    .insert({ email, role, class_id: chosenClass.classId });

  if (error) {
    if (error.code === "23505") return { error: "That email is already on the list." };
    if (error.code === "23514") {
      return { error: "Use a valid email or a rule like *@corp.gmail.com." };
    }
    return { error: "Could not add that email." };
  }

  revalidatePath("/admin/roster");
  return {};
}

export async function updateRole(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = roleFromForm(formData.get("role"));
  if (!email || !role) return;

  const supabase = await adminClient();
  const chosenClass = await classIdFromForm(supabase, formData.get("classId"));
  if ("error" in chosenClass) return;

  await supabase
    .from("allowed_emails")
    .update({ role, class_id: chosenClass.classId })
    .eq("email", email);
  await supabase.from("profiles").update({ class_id: chosenClass.classId }).eq("email", email);
  revalidatePath("/admin/roster");
}

export async function removeEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return;

  const supabase = await adminClient();
  await supabase.from("allowed_emails").delete().eq("email", email);
  revalidatePath("/admin/roster");
}
