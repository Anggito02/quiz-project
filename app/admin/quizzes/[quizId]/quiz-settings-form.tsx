"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateQuiz, type EditorState } from "./actions";

const initialState: EditorState = {};

export function QuizSettingsForm({
  quizId,
  title,
  description,
  status,
  courseId,
  courses,
}: {
  quizId: string;
  title: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  courseId: string | null;
  courses: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(updateQuiz, initialState);

  return (
    <form action={action} className="card mt-8 grid max-w-xl gap-4">
      <input type="hidden" name="quizId" value={quizId} />
      <div className="field">
        <label className="label" htmlFor="title">
          Title
        </label>
        <input className="input" id="title" name="title" type="text" defaultValue={title} required />
      </div>
      <div className="field">
        <label className="label" htmlFor="description">
          Description
        </label>
        <textarea
          className="input"
          id="description"
          name="description"
          rows={3}
          defaultValue={description ?? ""}
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="status">
          Status
        </label>
        <select className="input" id="status" name="status" defaultValue={status}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <div className="field">
        <label className="label" htmlFor="courseId">
          Course
        </label>
        {courses.length > 0 ? (
          <select
            className="input"
            id="courseId"
            name="courseId"
            required
            defaultValue={courseId ?? ""}
          >
            <option value="" disabled>
              Choose a course
            </option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        ) : (
          <>
            <select className="input" id="courseId" disabled defaultValue="">
              <option value="">No courses yet</option>
            </select>
            <p>
              <Link href="/admin/courses">Add a course</Link> before you assign one.
            </p>
          </>
        )}
      </div>
      {state.error ? <p className="error-text">{state.error}</p> : null}
      {state.notice ? <p className="notice">{state.notice}</p> : null}
      <button className="btn btn-admin" type="submit" disabled={pending}>
        Save quiz
      </button>
    </form>
  );
}
