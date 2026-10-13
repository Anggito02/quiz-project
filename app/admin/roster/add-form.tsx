"use client";

import { useActionState } from "react";
import { addEmail, type RosterState } from "./actions";

const initialState: RosterState = {};

export function AddEmailForm({ classes }: { classes: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(addEmail, initialState);

  return (
    <form action={action} className="card mt-8 grid max-w-xl gap-4">
      <div className="field">
        <label className="label" htmlFor="email">
          Email
        </label>
        <input className="input" id="email" name="email" type="email" required />
      </div>
      <div className="field">
        <label className="label" htmlFor="role">
          Role
        </label>
        <select className="input" id="role" name="role" defaultValue="student">
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="field">
        <label className="label" htmlFor="classId">
          Class
        </label>
        <select className="input" id="classId" name="classId" defaultValue="">
          <option value="">No class</option>
          {classes.map((row) => (
            <option key={row.id} value={row.id}>
              {row.name}
            </option>
          ))}
        </select>
      </div>
      {state.error ? <p className="error-text">{state.error}</p> : null}
      <button className="btn btn-admin" type="submit" disabled={pending}>
        Add email
      </button>
    </form>
  );
}
