"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type QuizFormState = {
  error?: string;
};

async function requireAdmin() {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/");
  return supabase;
}

export async function resolveCourseId(
  supabase: Awaited<ReturnType<typeof requireAdmin>>,
  raw: FormDataEntryValue | null,
): Promise<{ courseId: string | null } | { error: string }> {
  const courseId = String(raw ?? "").trim();
  const { count } = await supabase
    .from("courses")
    .select("id", { count: "exact", head: true });

  if ((count ?? 0) > 0 && !courseId) return { error: "Choose a course." };
  if (!courseId) return { courseId: null };

  const { data } = await supabase.from("courses").select("id").eq("id", courseId).maybeSingle();
  if (!data) return { error: "Choose a course." };
  return { courseId };
}

export async function createQuiz(
  _state: QuizFormState,
  formData: FormData,
): Promise<QuizFormState> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!title) return { error: "Enter a title." };

  const supabase = await requireAdmin();
  const course = await resolveCourseId(supabase, formData.get("courseId"));
  if ("error" in course) return { error: course.error };

  const { data, error } = await supabase
    .from("quizzes")
    .insert({
      title,
      description: description || null,
      status: "draft",
      course_id: course.courseId,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "Could not create that quiz." };

  revalidatePath("/admin/quizzes");
  redirect(`/admin/quizzes/${data.id}`);
}
