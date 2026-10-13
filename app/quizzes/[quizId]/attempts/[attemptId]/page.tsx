import { notFound, redirect } from "next/navigation";
import { type LeaderboardEntry } from "@/components/leaderboard-table";
import { ResultView } from "@/components/result-view";
import { getSessionProfile } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

type BoardRow = {
  rank: number;
  student_id: string;
  display_name: string;
  score: number;
  submitted_at: string;
};

export default async function AttemptPage({
  params,
}: {
  params: Promise<{ quizId: string; attemptId: string }>;
}) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const { quizId, attemptId } = await params;
  const supabase = await createClient();
  const { data: attempt } = await supabase
    .from("attempts")
    .select("id, quiz_id, score, correct_count, question_count, submitted_at")
    .eq("id", attemptId)
    .eq("quiz_id", quizId)
    .maybeSingle();

  if (!attempt) notFound();

  const { data: board } = await supabase.rpc("quiz_leaderboard", { p_quiz_id: quizId });

  const incorrect = attempt.question_count - attempt.correct_count;
  const entries: LeaderboardEntry[] = ((board ?? []) as BoardRow[]).map((row) => ({
    rank: Number(row.rank),
    studentId: row.student_id,
    displayName: row.display_name,
    value: `${row.score}%`,
    submittedAt: row.submitted_at,
  }));

  return (
    <ResultView
      actions={[{ href: "/quizzes", label: "Back to quizzes" }]}
      correct={attempt.correct_count}
      incorrect={incorrect}
      badge={`${attempt.score}%`}
      caption={`${attempt.question_count} answered.`}
      entries={entries}
      currentUserId={profile.id}
      valueHeading="Score"
      summary="Best score for each student. The top 100 are shown."
    />
  );
}
