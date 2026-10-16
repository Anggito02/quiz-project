"use client";

import { useActionState } from "react";
import { startUnlimited, type UnlimitedState } from "./actions";

const initialState: UnlimitedState = {};

export function UnlimitedSetupForm({ courses }: { courses: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(startUnlimited, initialState);

  return (
    <form action={action} className="card mt-8 grid max-w-xl gap-4">
      <fieldset className="grid gap-2">
        <legend className="label">Courses</legend>
        {courses.map((course) => (
          <label className="flex items-center gap-3" key={course.id}>
            <input type="checkbox" name="courseId" value={course.id} />
            <span>{course.name}</span>
          </label>
        ))}
      </fieldset>
      <fieldset className="grid gap-2">
        <legend className="label">Time</legend>
        {[5, 10, 20].map((minutes) => (
          <label className="flex items-center gap-3" key={minutes}>
            <input type="radio" name="duration" value={minutes} required={minutes === 5} />
            <span>{minutes} minutes</span>
          </label>
        ))}
      </fieldset>
      {state.error ? <p className="error-text">{state.error}</p> : null}
      <button className="btn btn-quiz justify-self-start" type="submit" disabled={pending} aria-busy={pending}>
        {pending ? "Starting…" : "Start"}
      </button>
    </form>
  );
}
