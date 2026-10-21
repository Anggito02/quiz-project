"use client";

import { useActionState } from "react";
import { addEmail, type RosterState } from "./actions";

const initialState: RosterState = {};

export function AddEmailForm() {
  const [state, action, pending] = useActionState(addEmail, initialState);

  return (
    <form action={action} className="card mt-8 grid max-w-xl gap-4">
      <div className="field">
        <label className="label" htmlFor="email">
          Admin email
        </label>
        <input
          className="input"
          id="email"
          name="email"
          type="email"
          required
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <p className="muted">Only administrators sign in with email and password.</p>
      </div>
      {state.error ? <p className="error-text">{state.error}</p> : null}
      <button className="btn btn-admin" type="submit" disabled={pending}>
        Add admin
      </button>
    </form>
  );
}
