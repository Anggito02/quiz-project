"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { revalidateLeaderboardScores } from "@/lib/leaderboard-board";
import { createClient } from "@/lib/supabase/server";

export type SubmitState = {
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

export async function submitQuiz(_state: SubmitState, formData: FormData): Promise<SubmitState> {
  const quizId = String(formData.get("quizId") ?? "");
  const answers = readAnswers(formData.get("answers"));
  if (!quizId) return { error: "Missing quiz." };
  if (!answers) return { error: "Could not read your answers." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_attempt", {
    p_quiz_id: quizId,
    p_answers: answers,
  });

  if (error || !data) {
    return { error: error?.message ?? "Could not submit that quiz." };
  }

  revalidatePath(`/quizzes/${quizId}`);
  revalidateLeaderboardScores();
  redirect(`/quizzes/${quizId}/attempts/${data}`);
}
