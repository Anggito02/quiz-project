"use client";

import { useActionState, useState } from "react";
import { signUp, type SignUpState } from "./actions";

const initialState: SignUpState = {};

type ClassOption = {
  id: string;
  name: string;
};

export function SignUpForm({ classes }: { classes: ClassOption[] }) {
  const [state, action, pending] = useActionState(signUp, initialState);
  const [step, setStep] = useState<1 | 2>(1);
  const onDetails = step === 1;

  function goToAccount(form: HTMLFormElement) {
    if (!form.reportValidity()) return;
    setStep(2);
  }

  return (
    <form
      action={action}
      className="card grid gap-4"
      onSubmit={(event) => {
        if (!onDetails) return;
        event.preventDefault();
        goToAccount(event.currentTarget);
      }}
    >
      <p className="muted text-center">Step {step} of 2</p>
      <div className="auth-steps" aria-hidden="true">
        <span className={onDetails ? "auth-step-dot is-active" : "auth-step-dot"} />
        <span className={onDetails ? "auth-step-dot" : "auth-step-dot is-active"} />
      </div>

      <div hidden={!onDetails}>
        <div className="grid gap-4">
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
              required={onDetails}
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="classId">
              Class
            </label>
            <select className="input" id="classId" name="classId" defaultValue="" required={onDetails}>
              <option value="" disabled>
                Choose your class
              </option>
              {classes.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name}
                </option>
              ))}
            </select>
            <p className="muted">
              If your email was added with a domain rule, you can change this later from your
              profile.
            </p>
          </div>
          <button
            className="btn btn-primary"
            type="button"
            disabled={classes.length === 0}
            onClick={(event) => {
              const form = event.currentTarget.form;
              if (form) goToAccount(form);
            }}
          >
            Next
          </button>
        </div>
      </div>

      <div hidden={onDetails}>
        <div className="grid gap-4">
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
              required={!onDetails}
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
              required={!onDetails}
            />
          </div>
          {state.error ? <p className="error-text">{state.error}</p> : null}
          {state.notice ? <p className="notice">{state.notice}</p> : null}
          <div className="auth-step-actions">
            <button
              className="btn btn-ghost"
              type="button"
              disabled={pending}
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={pending || classes.length === 0}
              aria-busy={pending}
            >
              {pending ? "Signing up…" : "Sign up"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
