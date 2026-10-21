"use client";

import { useActionState } from "react";
import { logInAdmin, type LoginState } from "./actions";

const initialState: LoginState = {};

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(logInAdmin, initialState);

  return (
    <form action={action} className="card grid gap-4">
      <div className="field">
        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          className="input"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          className="input"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {state.error ? <p className="error-text">{state.error}</p> : null}
      <button className="btn btn-primary" type="submit" disabled={pending} aria-busy={pending}>
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
