import Link from "next/link";
import { Suspense } from "react";
import { AdminLoading } from "@/components/loading-frame";
import { SearchParamsPending } from "@/components/search-params-pending";
import { createClient } from "@/lib/supabase/server";
import { CreateQuizForm } from "./create-form";

const PAGE_SIZE = 60;

type QuizRow = {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  courses: { name: string } | { name: string }[] | null;
};

function courseName(value: QuizRow["courses"]) {
  if (!value) return null;
  return Array.isArray(value) ? value[0]?.name ?? null : value.name;
}

function groupByCourse(quizzes: QuizRow[]) {
  const groups = new Map<string, QuizRow[]>();
  for (const quiz of quizzes) {
    const name = courseName(quiz.courses) ?? "No course";
    const list = groups.get(name) ?? [];
    list.push(quiz);
    groups.set(name, list);
  }
  return [...groups.entries()].sort(([left], [right]) => {
    if (left === "No course") return 1;
    if (right === "No course") return -1;
    return left.localeCompare(right);
  });
}

async function QuizBuilderCatalog({ pageParam }: { pageParam?: string }) {
  const requestedPage = Number(pageParam);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const from = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();
  const [{ data, count }, { data: courseData }] = await Promise.all([
    supabase
      .from("quizzes")
      .select("id, title, description, status, courses(name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1),
    supabase.from("courses").select("id, name").order("name", { ascending: true }),
  ]);

  const quizzes = (data ?? []) as QuizRow[];
  const courses = (courseData ?? []) as { id: string; name: string }[];
  const pageCount = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <main className="page">
      <h1>Quiz builder</h1>
      <p className="mt-4 max-w-[72ch]">
        Create a quiz, add questions, then publish it. Students see published quizzes only.
      </p>
      <CreateQuizForm courses={courses} />
      {quizzes.length === 0 ? (
        <p className="mt-8">No quizzes yet.</p>
      ) : (
        groupByCourse(quizzes).map(([name, items]) => (
          <section className="course-group" key={name}>
            <h2 className="course-label">{name}</h2>
            <ul className="card-grid">
              {items.map((quiz) => (
                <li className="resource-card" key={quiz.id}>
                  <span className="tag">{quiz.status}</span>
                  <h3>{quiz.title}</h3>
                  {quiz.description ? <p className="lede">{quiz.description}</p> : null}
                  <Link className="btn btn-primary btn-sm mt-2" href={`/admin/quizzes/${quiz.id}`}>
                    Edit quiz
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
      {pageCount > 1 ? (
        <nav className="pager" aria-label="Pages">
          {page > 1 ? (
            <Link className="btn btn-ghost btn-sm" href={`/admin/quizzes?page=${page - 1}`}>
              Previous
            </Link>
          ) : null}
          <span className="muted">
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Link className="btn btn-ghost btn-sm" href={`/admin/quizzes?page=${page + 1}`}>
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}

export default async function QuizBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;

  return (
    <Suspense key={pageParam ?? "1"} fallback={<AdminLoading />}>
      <SearchParamsPending fallback={<AdminLoading />}>
        <QuizBuilderCatalog pageParam={pageParam} />
      </SearchParamsPending>
    </Suspense>
  );
}
