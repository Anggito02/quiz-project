"use client";

import { useActionState } from "react";
import { signUp, type SignUpState } from "./actions";

const initialState: SignUpState = {};

type ClassOption = {
  id: string;
  name: string;
};

export function SignUpForm({ classes }: { classes: ClassOption[] }) {
  const [state, action, pending] = useActionState(signUp, initialState);

  return (
    <form action={action} className="card grid gap-4">
      <div className="field">
        <label className="label" htmlFor="displayName">
          Display name
        </label>
        <input
          className="input"
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="nickname"
          required
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="classId">
          Class
        </label>
        <select className="input" id="classId" name="classId" defaultValue="" required>
          <option value="" disabled>
            Choose your class
          </option>
          {classes.map((row) => (
            <option key={row.id} value={row.id}>
              {row.name}
            </option>
          ))}
        </select>
        <p className="muted">If your email was added with a domain rule, you can change this later from your profile.</p>
      </div>
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
          autoComplete="new-password"
          required
        />
      </div>
      {state.error ? <p className="error-text">{state.error}</p> : null}
      {state.notice ? <p className="notice">{state.notice}</p> : null}
      <button
        className="btn btn-primary"
        type="submit"
        disabled={pending || classes.length === 0}
        aria-busy={pending}
      >
        {pending ? "Signing up…" : "Sign up"}
      </button>
    </form>
  );
}
