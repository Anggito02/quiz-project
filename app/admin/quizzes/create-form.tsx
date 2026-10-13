"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createQuiz, type QuizFormState } from "./actions";

const initialState: QuizFormState = {};

export function CreateQuizForm({ courses }: { courses: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(createQuiz, initialState);

  return (
    <form action={action} className="card mt-8 grid max-w-xl gap-4">
      <div className="field">
        <label className="label" htmlFor="title">
          Title
        </label>
        <input className="input" id="title" name="title" type="text" required />
      </div>
      <div className="field">
        <label className="label" htmlFor="description">
          Description
        </label>
        <textarea className="input" id="description" name="description" rows={3} />
      </div>
      <div className="field">
        <label className="label" htmlFor="courseId">
          Course
        </label>
        {courses.length > 0 ? (
          <select className="input" id="courseId" name="courseId" required defaultValue="">
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
            <select className="input" id="courseId" name="courseId" disabled defaultValue="">
              <option value="">No courses yet</option>
            </select>
            <p>
              <Link href="/admin/courses">Add a course</Link> before you assign one.
            </p>
          </>
        )}
      </div>
      {state.error ? <p className="error-text">{state.error}</p> : null}
      <button className="btn btn-admin" type="submit" disabled={pending}>
        Create quiz
      </button>
    </form>
  );
}
