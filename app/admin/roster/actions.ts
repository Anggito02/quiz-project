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

function roleFromForm(value: FormDataEntryValue | null) {
  const role = String(value ?? "");
  if (role === "admin" || role === "student") return role;
  return null;
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
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = roleFromForm(formData.get("role"));

  if (!email.includes("@") || !role) {
    return { error: "Enter a valid email and role." };
  }

  const supabase = await adminClient();
  const chosenClass = await classIdFromForm(supabase, formData.get("classId"));
  if ("error" in chosenClass) return { error: chosenClass.error };

  const { error } = await supabase
    .from("allowed_emails")
    .insert({ email, role, class_id: chosenClass.classId });

  if (error) {
    if (error.code === "23505") return { error: "That email is already on the list." };
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
