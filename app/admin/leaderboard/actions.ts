"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { revalidateLeaderboardScores } from "@/lib/leaderboard-board";
import { createClient } from "@/lib/supabase/server";

export async function resetLeaderboard(formData: FormData) {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/");

  if (formData.get("confirm") !== "on") {
    redirect("/admin/leaderboard?error=confirm");
  }

  const scope = String(formData.get("scope") ?? "");
  let quizId: string | null = null;
  let duration: number | null = null;

  if (scope === "quiz") {
    quizId = String(formData.get("quizId") ?? "");
    if (!quizId) redirect("/admin/leaderboard?error=1");
  } else if (scope === "unlimited") {
    const minutes = Number(formData.get("minutes"));
    if (minutes !== 5 && minutes !== 10 && minutes !== 20) {
      redirect("/admin/leaderboard?error=1");
    }
    duration = minutes;
  } else if (scope !== "all") {
    redirect("/admin/leaderboard?error=1");
  }

  const { error } = await supabase.rpc("reset_leaderboard", {
    p_quiz_id: quizId,
    p_duration: duration,
  });
  if (error) redirect("/admin/leaderboard?error=1");

  revalidatePath("/leaderboard");
  revalidatePath("/admin/leaderboard");
  revalidateLeaderboardScores();
  if (quizId) {
    revalidatePath("/quizzes");
    revalidatePath(`/quizzes/${quizId}`, "layout");
  } else if (duration) {
    revalidatePath("/unlimited", "layout");
  } else {
    revalidatePath("/quizzes", "layout");
    revalidatePath("/unlimited", "layout");
  }

  const next = new URLSearchParams();
  next.set("reset", scope === "all" ? "all" : "board");
  if (quizId) next.set("quiz", quizId);
  if (duration) next.set("minutes", String(duration));
  redirect(`/admin/leaderboard?${next.toString()}`);
}
