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

export default async function QuizLeaderboardPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const { quizId } = await params;
  const supabase = await createClient();
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, title, status")
    .eq("id", quizId)
    .maybeSingle();

  if (!quiz || (quiz.status !== "published" && profile.role !== "admin")) notFound();

  const { data } = await supabase.rpc("quiz_leaderboard", { p_quiz_id: quizId });
  const entries: LeaderboardEntry[] = ((data ?? []) as BoardRow[]).map((row) => ({
    rank: Number(row.rank),
    studentId: row.student_id,
    displayName: row.display_name,
    value: `${row.score}%`,
    submittedAt: row.submitted_at,
  }));

  return (
    <main className="page">
      <p>
        <Link href={`/quizzes/${quizId}`}>{quiz.title}</Link>
      </p>
      <h1 className="mt-4">Leaderboard</h1>
      <LeaderboardTable entries={entries} currentUserId={profile.id} valueHeading="Score" />
    </main>
  );
}
