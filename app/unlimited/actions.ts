"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type UnlimitedState = {
  error?: string;
};

function readAnswers(raw: FormDataEntryValue | null) {
  try {
    const parsed = JSON.parse(String(raw ?? "{}")) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const answers: Record<string, string[]> = {};
    for (const [questionId, value] of Object.entries(parsed)) {
      if (!Array.isArray(value)) return null;
      answers[questionId] = value.map((item) => String(item));
    }
    return answers;
  } catch {
    return null;
  }
}

export async function startUnlimited(
  _state: UnlimitedState,
  formData: FormData,
): Promise<UnlimitedState> {
  const courseIds = formData.getAll("courseId").map((value) => String(value)).filter(Boolean);
  const duration = Number(formData.get("duration"));
  if (courseIds.length === 0) return { error: "Choose at least one course." };
  if (duration !== 5 && duration !== 10 && duration !== 20) {
    return { error: "Choose 5, 10, or 20 minutes." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("start_unlimited_session", {
    p_course_ids: courseIds,
    p_duration: duration,
  });

  if (error || !data) {
    return { error: error?.message ?? "Could not start that quiz." };
  }

  redirect(`/unlimited/${data}`);
}

export async function submitUnlimited(
  _state: UnlimitedState,
  formData: FormData,
): Promise<UnlimitedState> {
  const sessionId = String(formData.get("sessionId") ?? "");
  const answers = readAnswers(formData.get("answers"));
  if (!sessionId) return { error: "Missing timed quiz." };
  if (!answers) return { error: "Could not read your answers." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_unlimited_session", {
    p_session_id: sessionId,
    p_answers: answers,
  });

  if (error) return { error: error.message };

  revalidatePath(`/unlimited/${sessionId}`);
  revalidatePath("/unlimited");
  redirect(`/unlimited/${sessionId}`);
}
