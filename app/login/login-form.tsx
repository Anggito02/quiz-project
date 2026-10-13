"use client";

import { useActionState } from "react";
import { logIn, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(logIn, initialState);

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
      <button className="btn btn-primary" type="submit" disabled={pending}>
        Log in
      </button>
    </form>
  );
}
