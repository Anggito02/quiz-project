import { PendingLink } from "@/components/pending-link";
import { QuizCatalogBoard } from "@/components/quiz-catalog-board";
import { QuizzesLoading } from "@/components/loading-frame";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getPublishedCatalog, getTrendingQuizzes, type TrendingQuiz } from "@/lib/quiz-catalog";
import { getSessionProfile } from "@/lib/session";

function TrendingCards({ quizzes }: { quizzes: TrendingQuiz[] }) {
  return (
    <ul className="card-grid">
      {quizzes.map((quiz) => (
        <li className="resource-card" key={quiz.id}>
          <p className="tag">{quiz.courseName}</p>
          <h3>
            <PendingLink href={`/quizzes/${quiz.id}`}>{quiz.title}</PendingLink>
          </h3>
          {quiz.description ? <p className="lede">{quiz.description}</p> : null}
          <p className="muted">
            {quiz.attemptCount} {quiz.attemptCount === 1 ? "attempt" : "attempts"} this week
          </p>
          <p className="mt-2 flex flex-wrap gap-3">
            <PendingLink className="btn btn-quiz btn-sm" href={`/quizzes/${quiz.id}`}>
              Start quiz
            </PendingLink>
            <PendingLink className="btn btn-ghost btn-sm" href={`/leaderboard?quiz=${quiz.id}`}>
              Leaderboard
            </PendingLink>
          </p>
        </li>
      ))}
    </ul>
  );
}

async function QuizzesCatalog() {
  const [catalog, trending] = await Promise.all([getPublishedCatalog(), getTrendingQuizzes()]);

  return (
    <main className="page">
      <h1>Quizzes</h1>
      <p className="mt-4 max-w-[72ch]">Published practice quizzes.</p>

      {trending.length > 0 ? (
        <section className="course-group">
          <h2>Trending</h2>
          <p className="muted">Most attempts in the last 7 days.</p>
          <TrendingCards quizzes={trending} />
        </section>
      ) : null}

      <Suspense fallback={null}>
        <QuizCatalogBoard catalog={catalog} />
      </Suspense>
    </main>
  );
}

export default async function QuizzesPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  return (
    <Suspense fallback={<QuizzesLoading />}>
      <QuizzesCatalog />
    </Suspense>
  );
}
