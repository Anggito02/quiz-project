"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type QuizOption = {
  id: string;
  title: string;
  courseKey: string;
  courseName: string;
};

export function QuizBoardPicker({
  basePath,
  quizzes,
  quizId,
  classId,
}: {
  basePath: string;
  quizzes: QuizOption[];
  quizId?: string;
  classId?: string;
}) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = quizzes.find((quiz) => quiz.id === quizId);
  const [query, setQuery] = useState(selected?.title ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, []);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    const showingSelected = selected != null && query === selected.title;
    const pool =
      !term || showingSelected
        ? quizzes
        : quizzes.filter(
            (quiz) =>
              quiz.title.toLowerCase().includes(term) ||
              quiz.courseName.toLowerCase().includes(term),
          );
    return pool.slice(0, 12);
  }, [query, quizzes, selected]);

  function choose(quiz: QuizOption) {
    const next = new URLSearchParams();
    if (classId) next.set("class", classId);
    if (quiz.courseKey !== "none") next.set("course", quiz.courseKey);
    next.set("quiz", quiz.id);
    setQuery(quiz.title);
    setOpen(false);
    router.push(`${basePath}?${next.toString()}`);
  }

  return (
    <div className="quiz-picker mt-6" ref={rootRef}>
      <label className="label" htmlFor={`${listId}-input`}>
        Quiz
      </label>
      <input
        id={`${listId}-input`}
        className="input mt-2"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        value={query}
        placeholder="Search quizzes"
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActive((current) => Math.min(current + 1, Math.max(matches.length - 1, 0)));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((current) => Math.max(current - 1, 0));
          } else if (event.key === "Enter" && open && matches[active]) {
            event.preventDefault();
            choose(matches[active]);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open ? (
        <ul className="quiz-picker-list" id={listId} role="listbox">
          {matches.length === 0 ? (
            <li className="muted" style={{ padding: "8px 10px" }}>
              No quizzes match.
            </li>
          ) : (
            matches.map((quiz, index) => (
              <li key={quiz.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  id={`${listId}-${index}`}
                  aria-selected={index === active}
                  className={index === active ? "quiz-picker-option is-active" : "quiz-picker-option"}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(quiz)}
                >
                  <span>{quiz.title}</span>
                  <span className="muted">{quiz.courseName}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
