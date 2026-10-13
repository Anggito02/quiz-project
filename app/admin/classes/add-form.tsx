"use client";

import { useActionState } from "react";
import { addClass, removeClass, type CatalogState } from "./actions";

const initialState: CatalogState = {};

export function AddClassForm() {
  const [state, action, pending] = useActionState(addClass, initialState);

  return (
    <form action={action} className="card mt-8 grid max-w-xl gap-4">
      <div className="field">
        <label className="label" htmlFor="class-name">
          Class name
        </label>
        <input className="input" id="class-name" name="name" type="text" required />
      </div>
      {state.error ? <p className="error-text">{state.error}</p> : null}
      <button className="btn btn-admin" type="submit" disabled={pending}>
        Add class
      </button>
    </form>
  );
}

export function RemoveClassForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(removeClass, initialState);

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
