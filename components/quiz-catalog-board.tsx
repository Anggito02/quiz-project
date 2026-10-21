"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useMemo, useState, useTransition } from "react";
import { PendingLink } from "@/components/pending-link";
import {
  filterCatalogQuizzes,
  type CatalogCourse,
  type CatalogQuiz,
  type PublishedCatalog,
} from "@/lib/quiz-catalog-shared";

const PAGE_SIZE = 9;

function catalogHref(options: { course?: string; q?: string; page?: number }) {
  const params = new URLSearchParams();
  if (options.course) params.set("course", options.course);
  if (options.q) params.set("q", options.q);
  if (options.page && options.page > 1) params.set("page", String(options.page));
  const query = params.toString();
  return query ? `/quizzes?${query}` : "/quizzes";
}

function resolveCourseKey(catalog: PublishedCatalog, courseParam: string | null) {
  if (courseParam === "none" && catalog.uncategorized > 0) return "none";
  if (courseParam && catalog.courses.some((course) => course.id === courseParam)) return courseParam;
  return undefined;
}

function QuizCards({ quizzes }: { quizzes: CatalogQuiz[] }) {
  return (
    <ul className="card-grid">
      {quizzes.map((quiz) => (
        <li className="resource-card" key={quiz.id}>
          <p className="tag">{quiz.courseName}</p>
          <h3>
            <PendingLink href={`/quizzes/${quiz.id}`}>{quiz.title}</PendingLink>
          </h3>
          {quiz.description ? <p className="lede">{quiz.description}</p> : null}
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

export function QuizCatalogBoard({ catalog }: { catalog: PublishedCatalog }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const urlCourse = searchParams.get("course");
  const urlQ = (searchParams.get("q") ?? "").trim().slice(0, 80);
  const urlPageRaw = Number(searchParams.get("page"));
  const urlPage = Number.isInteger(urlPageRaw) && urlPageRaw > 0 ? urlPageRaw : 1;

  const [draftQ, setDraftQ] = useState(urlQ);
  const [optimisticCourse, setOptimisticCourse] = useState<string | null>(null);
  const [optimisticQ, setOptimisticQ] = useState<string | null>(null);
  const [optimisticPage, setOptimisticPage] = useState<number | null>(null);

  useEffect(() => {
    setOptimisticCourse(null);
    setOptimisticQ(null);
    setOptimisticPage(null);
    setDraftQ(urlQ);
  }, [urlCourse, urlQ, urlPage]);

  useEffect(() => {
    const hrefs = [
      catalogHref({ q: urlQ }),
      ...catalog.courses.map((course) => catalogHref({ course: course.id, q: urlQ })),
      ...(catalog.uncategorized > 0 ? [catalogHref({ course: "none", q: urlQ })] : []),
    ];
    for (const href of hrefs) router.prefetch(href);
  }, [catalog.courses, catalog.uncategorized, router, urlQ]);

  const courseKey =
    optimisticCourse !== null
      ? optimisticCourse || undefined
      : resolveCourseKey(catalog, urlCourse);
  const q = optimisticQ !== null ? optimisticQ : urlQ;
  const page = optimisticPage ?? urlPage;
  const activeCourse = catalog.courses.find((course) => course.id === courseKey);

  const filtered = useMemo(
    () => filterCatalogQuizzes(catalog.quizzes, { courseKey, q }),
    [catalog.quizzes, courseKey, q],
  );
  const total = filtered.length;
  const pageCount = total === 0 ? 0 : Math.ceil(total / PAGE_SIZE);
  const safePage = pageCount === 0 ? 1 : Math.min(page, pageCount);
  const quizzes = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (number) => number === 1 || number === pageCount || Math.abs(number - safePage) <= 1,
  );

  function go(options: { course?: string; q?: string; page?: number }) {
    setOptimisticCourse(options.course ?? "");
    setOptimisticQ(options.q ?? "");
    setOptimisticPage(options.page && options.page > 1 ? options.page : 1);
    startTransition(() => {
      router.push(catalogHref(options));
    });
  }

  return (
    <>
      <nav className="tab-row" aria-label="Courses">
        <button
          type="button"
          className={courseKey ? "tab" : "tab is-active"}
          onClick={() => go({ q })}
        >
          All courses
        </button>
        {catalog.courses.map((course: CatalogCourse) => (
          <button
            type="button"
            className={courseKey === course.id ? "tab is-active" : "tab"}
            key={course.id}
            onClick={() => go({ course: course.id, q })}
          >
            {course.name}
          </button>
        ))}
        {catalog.uncategorized > 0 ? (
          <button
            type="button"
            className={courseKey === "none" ? "tab is-active" : "tab"}
            onClick={() => go({ course: "none", q })}
          >
            No course
          </button>
        ) : null}
      </nav>

      <form
        className="search-row"
        onSubmit={(event) => {
          event.preventDefault();
          const nextQ = draftQ.trim().slice(0, 80);
          go({ course: courseKey, q: nextQ });
        }}
      >
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
            value={draftQ}
            onChange={(event) => setDraftQ(event.target.value)}
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
          {safePage > 1 ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => go({ course: courseKey, q })}>
              Back to page 1
            </button>
          ) : null}
        </p>
      ) : (
        <section className="course-group">
          <QuizCards quizzes={quizzes} />
        </section>
      )}

      {pageCount > 1 ? (
        <nav className="pager" aria-label="Pages">
          {safePage > 1 ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => go({ course: courseKey, q, page: safePage - 1 })}
            >
              Previous
            </button>
          ) : null}
          {pageNumbers.map((number, index) => {
            const previous = pageNumbers[index - 1];
            const gap = previous != null && number - previous > 1;
            return (
              <Fragment key={number}>
                {gap ? <span className="muted">…</span> : null}
                {number === safePage ? (
                  <span className="tab is-active" aria-current="page">
                    {number}
                  </span>
                ) : (
                  <button
                    type="button"
                    className="tab"
                    onClick={() => go({ course: courseKey, q, page: number })}
                  >
                    {number}
                  </button>
                )}
              </Fragment>
            );
          })}
          {safePage < pageCount ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => go({ course: courseKey, q, page: safePage + 1 })}
            >
              Next
            </button>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}
