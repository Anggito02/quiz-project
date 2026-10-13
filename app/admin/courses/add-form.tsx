"use client";

import { useActionState } from "react";
import { addCourse, removeCourse, type CatalogState } from "./actions";

const initialState: CatalogState = {};

export function AddCourseForm() {
  const [state, action, pending] = useActionState(addCourse, initialState);

  return (
    <form action={action} className="card mt-8 grid max-w-xl gap-4">
      <div className="field">
        <label className="label" htmlFor="name">
          Course name
        </label>
        <input className="input" id="name" name="name" type="text" required />
      </div>
      {state.error ? <p className="error-text">{state.error}</p> : null}
      <button className="btn btn-admin" type="submit" disabled={pending}>
        Add course
      </button>
    </form>
  );
}

export function RemoveCourseForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(removeCourse, initialState);

  return (
    <form action={action} className="grid justify-items-start gap-2">
      <input type="hidden" name="id" value={id} />
      {state.error ? <p className="error-text">{state.error}</p> : null}
      <button className="btn btn-danger btn-sm" type="submit" disabled={pending}>
        Remove
      </button>
    </form>
  );
}
