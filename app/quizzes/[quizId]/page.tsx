import { notFound, redirect } from "next/navigation";
import { PendingLink } from "@/components/pending-link";
import { getSessionProfile } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { TakeQuizForm } from "./take-form";

function formatWhen(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export default async function TakeQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const { quizId } = await params;
  const supabase = await createClient();
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, title, description, status")
    .eq("id", quizId)
    .maybeSingle();

  if (!quiz || quiz.status !== "published") notFound();

  const { data: questionData } = await supabase
    .from("questions")
    .select("id, prompt, type, position, options(id, label, position)")
    .eq("quiz_id", quizId)
    .order("position", { ascending: true });

  const questions = (questionData ?? [])
    .map((question) => {
      const options = [...(question.options ?? [])].sort(
        (left, right) => left.position - right.position,
      );
      return {
        id: question.id,
        prompt: question.prompt,
        type: question.type as "single" | "multi",
        options: options.map((option) => ({ id: option.id, label: option.label })),
      };
    })
    .filter((question) => question.options.length >= 2);

  const { data: attemptData } = await supabase
    .from("attempts")
    .select("id, score, submitted_at")
    .eq("quiz_id", quizId)
    .eq("student_id", profile.id)
    .order("submitted_at", { ascending: false });

  const attempts = attemptData ?? [];

  return (
    <main className="page quiz-detail">
      <section className="board-panel quiz-start-card">
        <PendingLink className="btn btn-ghost btn-sm" href="/quizzes">
          All quizzes
        </PendingLink>
        <h1>{quiz.title}</h1>
        {quiz.description ? <p className="lede">{quiz.description}</p> : null}
        <p className="quiz-meta muted">
          {countLabel(questions.length, "question", "questions")} ·{" "}
          {countLabel(attempts.length, "attempt", "attempts")}
        </p>
        <h2>Your attempts</h2>
        {attempts.length === 0 ? (
          <p className="muted">No attempts yet.</p>
        ) : (
          <ul className="ruled-list">
            {attempts.map((attempt) => (
              <li key={attempt.id}>
                <PendingLink href={`/quizzes/${quiz.id}/attempts/${attempt.id}`}>
                  {formatWhen(attempt.submitted_at)} — {attempt.score}%
                </PendingLink>
              </li>
            ))}
          </ul>
        )}
        <div className="quiz-start-actions">
          {questions.length === 0 ? (
            <p>This quiz has no questions yet.</p>
          ) : profile.role === "student" ? (
            <TakeQuizForm quizId={quiz.id} questions={questions} />
          ) : (
            <p>Only students can submit an attempt.</p>
          )}
          <PendingLink className="btn btn-ghost btn-sm" href={`/leaderboard?quiz=${quiz.id}`}>
            Leaderboard
          </PendingLink>
        </div>
      </section>
    </main>
  );
}
