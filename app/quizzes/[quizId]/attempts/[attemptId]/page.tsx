import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LeaderboardTable, type LeaderboardEntry } from "@/components/leaderboard-table";
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

  const [{ data: quiz }, { data: board }] = await Promise.all([
    supabase.from("quizzes").select("title").eq("id", quizId).maybeSingle(),
    supabase.rpc("quiz_leaderboard", { p_quiz_id: quizId }),
  ]);

  const incorrect = attempt.question_count - attempt.correct_count;
  const entries: LeaderboardEntry[] = ((board ?? []) as BoardRow[]).map((row) => ({
    rank: Number(row.rank),
    studentId: row.student_id,
    displayName: row.display_name,
    value: `${row.score}%`,
    submittedAt: row.submitted_at,
  }));

  return (
    <main className="page">
      <p>
        <Link className="btn btn-primary" href="/quizzes">
          Back to quizzes
        </Link>
      </p>
      <p className="mt-6">
        <Link href={`/quizzes/${quizId}`}>{quiz?.title ?? "Quiz"}</Link>
      </p>
      <h1 className="mt-4">Result</h1>
      <div className="result-summary">
        <p className="result-score">{attempt.score}%</p>
        <p className="badge badge-success">{attempt.correct_count} correct</p>
        <p className="badge badge-error">{incorrect} incorrect</p>
      </div>
      <LeaderboardTable entries={entries} currentUserId={profile.id} valueHeading="Score" />
    </main>
  );
}
