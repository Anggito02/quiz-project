import Link from "next/link";
import { Fragment } from "react";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 9;

type CourseEmbed = { name: string } | { name: string }[] | null;

type QuizCard = {
  id: string;
  title: string;
  description: string | null;
  courseName: string;
  attemptCount?: number;
};

type TrendingRow = {
  id: string;
  title: string;
  description: string | null;
  course_name: string | null;
  attempt_count: number;
};

function courseNameOf(course: CourseEmbed) {
  if (!course) return "No course";
  return Array.isArray(course) ? course[0]?.name ?? "No course" : course.name;
}

function catalogHref(options: { course?: string; q?: string; page?: number }) {
  const params = new URLSearchParams();
  if (options.course) params.set("course", options.course);
  if (options.q) params.set("q", options.q);
  if (options.page && options.page > 1) params.set("page", String(options.page));
  const query = params.toString();
  return query ? `/quizzes?${query}` : "/quizzes";
}

function searchFilter(term: string) {
  const cleaned = term.replace(/[%_\\",().:]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  const pattern = `"%${cleaned}%"`;
  return `title.ilike.${pattern},description.ilike.${pattern}`;
}

function QuizCards({ quizzes }: { quizzes: QuizCard[] }) {
  return (
    <ul className="card-grid">
      {quizzes.map((quiz) => (
        <li className="resource-card" key={quiz.id}>
          <p className="tag">{quiz.courseName}</p>
          <h3>
            <Link href={`/quizzes/${quiz.id}`}>{quiz.title}</Link>
          </h3>
          {quiz.description ? <p className="lede">{quiz.description}</p> : null}
          {quiz.attemptCount != null ? (
            <p className="muted">
              {quiz.attemptCount} {quiz.attemptCount === 1 ? "attempt" : "attempts"} this week
            </p>
          ) : null}
          <p className="mt-2 flex flex-wrap gap-3">
            <Link className="btn btn-quiz btn-sm" href={`/quizzes/${quiz.id}`}>
              Start quiz
            </Link>
            <Link className="btn btn-ghost btn-sm" href={`/leaderboard?quiz=${quiz.id}`}>
              Leaderboard
            </Link>
          </p>
        </li>
      ))}
    </ul>
  );
}

export default async function QuizzesPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; q?: string; page?: string }>;
}) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const { course: courseParam, q: queryParam, page: pageParam } = await searchParams;
  const q = (queryParam ?? "").trim().slice(0, 80);
  const requestedPage = Number(pageParam);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const supabase = await createClient();

  const [{ data: courseRows }, { count: uncategorized }, trendingResult] = await Promise.all([
    supabase
      .from("courses")
      .select("id, name, quizzes!inner(id)")
      .eq("quizzes.status", "published")
      .order("name", { ascending: true }),
    supabase
      .from("quizzes")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .is("course_id", null),
    supabase.rpc("trending_quizzes", { p_limit: 4 }),
  ]);

  const courses = [
    ...new Map(
      ((courseRows ?? []) as { id: string; name: string }[]).map((course) => [course.id, course]),
    ).values(),
  ];
  const courseKey =
    courseParam === "none" && (uncategorized ?? 0) > 0
      ? "none"
      : courses.some((course) => course.id === courseParam)
        ? courseParam
        : undefined;
  const activeCourse = courses.find((course) => course.id === courseKey);

  let listQuery = supabase
    .from("quizzes")
    .select("id, title, description, courses(name)", { count: "exact" })
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (courseKey === "none") listQuery = listQuery.is("course_id", null);
  else if (courseKey) listQuery = listQuery.eq("course_id", courseKey);

  const filter = q ? searchFilter(q) : null;
  if (filter) listQuery = listQuery.or(filter);

  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await listQuery.range(from, from + PAGE_SIZE - 1);
  const total = count ?? 0;
  const pageCount = total === 0 ? 0 : Math.ceil(total / PAGE_SIZE);

  const quizzes: QuizCard[] = ((data ?? []) as {
    id: string;
    title: string;
    description: string | null;
    courses: CourseEmbed;
  }[]).map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    courseName: courseNameOf(quiz.courses),
  }));

  const trending: QuizCard[] = trendingResult.error
    ? []
    : ((trendingResult.data ?? []) as TrendingRow[]).map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        courseName: quiz.course_name ?? "No course",
        attemptCount: Number(quiz.attempt_count),
      }));

  const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (number) => number === 1 || number === pageCount || Math.abs(number - page) <= 1,
  );

  return (
    <main className="page">
      <h1>Quizzes</h1>
      <p className="mt-4 max-w-[72ch]">Published practice quizzes.</p>

      {trending.length > 0 ? (
        <section className="course-group">
          <h2>Trending</h2>
          <p className="muted">Most attempts in the last 7 days.</p>
          <QuizCards quizzes={trending} />
        </section>
      ) : null}

      <nav className="tab-row" aria-label="Courses">
        <Link
          className={courseKey ? "tab" : "tab is-active"}
          href={catalogHref({ q })}
        >
          All courses
        </Link>
        {courses.map((course) => (
          <Link
            className={courseKey === course.id ? "tab is-active" : "tab"}
            href={catalogHref({ course: course.id, q })}
            key={course.id}
          >
            {course.name}
          </Link>
        ))}
        {(uncategorized ?? 0) > 0 ? (
          <Link
            className={courseKey === "none" ? "tab is-active" : "tab"}
            href={catalogHref({ course: "none", q })}
          >
            No course
          </Link>
        ) : null}
      </nav>

      <form className="search-row" action="/quizzes" method="get">
        {courseKey ? <input type="hidden" name="course" value={courseKey} /> : null}
        <div className="field">
          <label className="label" htmlFor="quiz-search">
            Search
          </label>
          <input
            className="input"
            id="quiz-search"
            name="q"
            type="search"
            maxLength={80}
            defaultValue={q}
            placeholder="Title or description"
          />
        </div>
        <button className="btn btn-primary" type="submit">
          Search
        </button>
      </form>

      {q ? (
        <p className="mt-4">
          Results for “{q}”
          {activeCourse ? ` in ${activeCourse.name}` : courseKey === "none" ? " with no course" : ""}.
        </p>
      ) : null}

      {quizzes.length === 0 ? (
        <p className="mt-8">
          {total === 0 ? "No published quizzes match this view." : "No quizzes on this page."}{" "}
          {page > 1 ? <Link href={catalogHref({ course: courseKey, q })}>Back to page 1</Link> : null}
        </p>
      ) : (
        <section className="course-group">
          <QuizCards quizzes={quizzes} />
        </section>
      )}

      {pageCount > 1 ? (
        <nav className="pager" aria-label="Pages">
          {page > 1 ? (
            <Link className="btn btn-ghost btn-sm" href={catalogHref({ course: courseKey, q, page: page - 1 })}>
              Previous
            </Link>
          ) : null}
          {pageNumbers.map((number, index) => {
            const previous = pageNumbers[index - 1];
            const gap = previous != null && number - previous > 1;
            return (
              <Fragment key={number}>
                {gap ? <span className="muted">…</span> : null}
                {number === page ? (
                  <span className="tab is-active" aria-current="page">
                    {number}
                  </span>
                ) : (
                  <Link className="tab" href={catalogHref({ course: courseKey, q, page: number })}>
                    {number}
                  </Link>
                )}
              </Fragment>
            );
          })}
          {page < pageCount ? (
            <Link className="btn btn-ghost btn-sm" href={catalogHref({ course: courseKey, q, page: page + 1 })}>
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}
