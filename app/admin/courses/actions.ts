"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CatalogState = {
  error?: string;
};

async function requireAdmin() {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/");
  return supabase;
}

export async function addCourse(
  _state: CatalogState,
  formData: FormData,
): Promise<CatalogState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Enter a course name." };

  const supabase = await requireAdmin();
  const { error } = await supabase.from("courses").insert({ name });
  if (error) {
    if (error.code === "23505") return { error: "That course already exists." };
    return { error: "Could not add that course." };
  }

  revalidatePath("/admin/courses");
  revalidatePath("/admin/quizzes");
  return {};
}

export async function removeCourse(
  _state: CatalogState,
  formData: FormData,
): Promise<CatalogState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing course." };

  const supabase = await requireAdmin();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error?.code === "23503") {
    return { error: "That course is still used by a quiz." };
  }
  if (error) return { error: "Could not remove that course." };

  revalidatePath("/admin/courses");
  revalidatePath("/admin/quizzes");
  revalidatePath("/quizzes");
  return {};
}
