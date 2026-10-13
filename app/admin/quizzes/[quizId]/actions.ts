"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resolveCourseId } from "@/app/admin/quizzes/actions";
import { MAX_IMPORT_BYTES, parseQuizWorkbook } from "@/lib/quiz-excel";
import { cleanOptions, validateQuestion, type OptionDraft, type QuestionType } from "@/lib/quiz-validation";
import { createClient } from "@/lib/supabase/server";

export type EditorState = {
  error?: string;
  notice?: string;
  saved?: string;
};

async function requireAdmin() {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/");
  return supabase;
}

function quizPath(quizId: string) {
  return `/admin/quizzes/${quizId}`;
}

export async function updateQuiz(
  _state: EditorState,
  formData: FormData,
): Promise<EditorState> {
  const quizId = String(formData.get("quizId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "");

  if (!quizId || !title) return { error: "Enter a title." };
  if (status !== "draft" && status !== "published" && status !== "archived") {
    return { error: "Choose a status." };
  }

  const supabase = await requireAdmin();
  const course = await resolveCourseId(supabase, formData.get("courseId"));
  if ("error" in course) return { error: course.error };

  if (status === "published") {
    const { count } = await supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("quiz_id", quizId);
    if (!count) return { error: "Add at least one question before publishing." };
  }

  const { error } = await supabase
    .from("quizzes")
    .update({
      title,
      description: description || null,
      status,
      course_id: course.courseId,
    })
    .eq("id", quizId);

  if (error) return { error: "Could not save that quiz." };

  revalidatePath(quizPath(quizId));
  revalidatePath("/admin/quizzes");
  revalidatePath("/quizzes");
  return { notice: "Quiz saved." };
}

function readOptions(formData: FormData): OptionDraft[] | null {
  try {
    const parsed = JSON.parse(String(formData.get("options") ?? "[]")) as OptionDraft[];
    if (!Array.isArray(parsed)) return null;
    return parsed.map((option) => ({
      label: String(option?.label ?? ""),
      isCorrect: Boolean(option?.isCorrect),
    }));
  } catch {
    return null;
  }
}

export async function saveQuestion(
  _state: EditorState,
  formData: FormData,
): Promise<EditorState> {
  const quizId = String(formData.get("quizId") ?? "");
  const questionId = String(formData.get("questionId") ?? "");
  const prompt = String(formData.get("prompt") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const options = readOptions(formData);

  if (!quizId) return { error: "Missing quiz." };
  if (!prompt) return { error: "Enter a prompt." };
  if (!options) return { error: "Could not read the options." };

  const validationError = validateQuestion(type, options);
  if (validationError) return { error: validationError };

  const cleaned = cleanOptions(options);
  const supabase = await requireAdmin();

  const { data: quiz } = await supabase.from("quizzes").select("id").eq("id", quizId).maybeSingle();
  if (!quiz) return { error: "That quiz was not found." };

  if (questionId) {
    const { error: updateError } = await supabase
      .from("questions")
      .update({ prompt, type })
      .eq("id", questionId)
      .eq("quiz_id", quizId);
    if (updateError) return { error: "Could not update that question." };

    const { error: deleteError } = await supabase.from("options").delete().eq("question_id", questionId);
    if (deleteError) return { error: "Could not update the options." };

    const { error: insertError } = await supabase.from("options").insert(
      cleaned.map((option, position) => ({
        question_id: questionId,
        label: option.label,
        is_correct: option.isCorrect,
        position,
      })),
    );
    if (insertError) return { error: "Could not save the options." };

    revalidatePath(quizPath(quizId));
    redirect(quizPath(quizId));
  }

  const { count } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("quiz_id", quizId);

  const { data: created, error: createError } = await supabase
    .from("questions")
    .insert({
      quiz_id: quizId,
      prompt,
      type: type as QuestionType,
      position: count ?? 0,
    })
    .select("id")
    .single();

  if (createError || !created) return { error: "Could not add that question." };

  const { error: optionError } = await supabase.from("options").insert(
    cleaned.map((option, position) => ({
      question_id: created.id,
      label: option.label,
      is_correct: option.isCorrect,
      position,
    })),
  );

  if (optionError) {
    await supabase.from("questions").delete().eq("id", created.id);
    return { error: "Could not save the options." };
  }

  revalidatePath(quizPath(quizId));
  return { notice: "Question added.", saved: created.id };
}

export async function importQuestions(
  _state: EditorState,
  formData: FormData,
): Promise<EditorState> {
  const quizId = String(formData.get("quizId") ?? "");
  const file = formData.get("file");
  if (!quizId) return { error: "Missing quiz." };
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an Excel file." };
  if (!file.name.toLowerCase().endsWith(".xlsx")) return { error: "Upload an .xlsx file." };
  if (file.size > MAX_IMPORT_BYTES) return { error: "That file is larger than 2 MB." };

  const bytes = Buffer.from(await file.arrayBuffer());
  const parsed = await parseQuizWorkbook(bytes);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await requireAdmin();
  const { data: quiz } = await supabase.from("quizzes").select("id").eq("id", quizId).maybeSingle();
  if (!quiz) return { error: "That quiz was not found." };

  const { count } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("quiz_id", quizId);
  const start = count ?? 0;
  const createdIds: string[] = [];

  for (const [index, question] of parsed.questions.entries()) {
    const { data: created, error: createError } = await supabase
      .from("questions")
      .insert({
        quiz_id: quizId,
        prompt: question.prompt,
        type: question.type,
        position: start + index,
      })
      .select("id")
      .single();

    if (createError || !created) {
      if (createdIds.length > 0) {
        await supabase.from("questions").delete().in("id", createdIds);
      }
      return { error: "Could not save the questions. Nothing from that file was kept." };
    }

    createdIds.push(created.id);
    const { error: optionError } = await supabase.from("options").insert(
      question.options.map((option, position) => ({
        question_id: created.id,
        label: option.label,
        is_correct: option.isCorrect,
        position,
      })),
    );

    if (optionError) {
      await supabase.from("questions").delete().in("id", createdIds);
      return { error: "Could not save the questions. Nothing from that file was kept." };
    }
  }

  revalidatePath(quizPath(quizId));
  const countLabel = parsed.questions.length === 1 ? "question" : "questions";
  return { notice: `Imported ${parsed.questions.length} ${countLabel}.` };
}

export async function deleteQuestion(formData: FormData) {
  const quizId = String(formData.get("quizId") ?? "");
  const questionId = String(formData.get("questionId") ?? "");
  if (!quizId || !questionId) return;

  const supabase = await requireAdmin();
  await supabase.from("questions").delete().eq("id", questionId).eq("quiz_id", quizId);
  revalidatePath(quizPath(quizId));
}

export async function moveQuestion(formData: FormData) {
  const quizId = String(formData.get("quizId") ?? "");
  const questionId = String(formData.get("questionId") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!quizId || !questionId) return;
  if (direction !== "up" && direction !== "down") return;

  const supabase = await requireAdmin();
  const { data } = await supabase
    .from("questions")
    .select("id, position, created_at")
    .eq("quiz_id", quizId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  const rows = data ?? [];
  const index = rows.findIndex((row) => row.id === questionId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= rows.length) return;

  const reordered = [...rows];
  const [moved] = reordered.splice(index, 1);
  if (!moved) return;
  reordered.splice(swapWith, 0, moved);

  await Promise.all(
    reordered.map((row, position) =>
      supabase.from("questions").update({ position }).eq("id", row.id),
    ),
  );

  revalidatePath(quizPath(quizId));
}
