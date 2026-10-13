import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LeaderboardTable, type LeaderboardEntry } from "@/components/leaderboard-table";
import { getSessionProfile } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { UnlimitedPlayForm } from "./play-form";

type BoardRow = {
  rank: number;
  student_id: string;
  display_name: string;
  correct_count: number;
  submitted_at: string;
};

type QuestionRow = {
  id: string;
  prompt: string;
  type: "single" | "multi";
  options: { id: string; label: string; position: number }[] | null;
};

export default async function UnlimitedSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const { sessionId } = await params;
  const supabase = await createClient();
  const { data: session } = await supabase
    .from("unlimited_sessions")
    .select("id, duration_minutes, question_ids, ends_at, submitted_at, correct_count, question_count")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session) notFound();

  if (session.submitted_at) {
    const { data: board } = await supabase.rpc("unlimited_leaderboard", {
      p_duration: session.duration_minutes,
    });
    const incorrect = session.question_count - session.correct_count;
    const entries: LeaderboardEntry[] = ((board ?? []) as BoardRow[]).map((row) => ({
      rank: Number(row.rank),
      studentId: row.student_id,
      displayName: row.display_name,
      value: String(row.correct_count),
      submittedAt: row.submitted_at,
    }));

    return (
      <main className="page">
        <p className="flex flex-wrap gap-3">
          <Link className="btn btn-primary" href="/quizzes">
            Back to quizzes
          </Link>
          <Link className="btn btn-ghost" href="/unlimited">
            Back to Unlimited
          </Link>
        </p>
        <h1 className="mt-6">Result</h1>
        <div className="result-summary">
          <p className="badge badge-success">{session.correct_count} correct</p>
          <p className="badge badge-error">{incorrect} incorrect</p>
          <p className="muted">
            {session.question_count} answered in a {session.duration_minutes} minute run.
          </p>
        </div>
        <LeaderboardTable
          entries={entries}
          currentUserId={profile.id}
          valueHeading="Correct"
          summary="Ranked by correct answers. The top 100 are shown. A run only appears on the board for its own time limit."
        />
      </main>
    );
  }

  const ids = (session.question_ids ?? []) as string[];
  const { data: questionData } = await supabase
    .from("questions")
    .select("id, prompt, type, options(id, label, position)")
    .in("id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]);

  const byId = new Map(
    ((questionData ?? []) as QuestionRow[]).map((question) => [question.id, question]),
  );
  const questions = ids
    .map((id) => byId.get(id))
    .filter((question): question is QuestionRow => Boolean(question))
    .map((question) => ({
      id: question.id,
      prompt: question.prompt,
      type: question.type,
      options: [...(question.options ?? [])]
        .sort((left, right) => left.position - right.position)
        .map((option) => ({ id: option.id, label: option.label })),
    }))
    .filter((question) => question.options.length >= 2);

  return (
    <UnlimitedPlayForm sessionId={session.id} endsAt={session.ends_at} questions={questions} />
  );
}
