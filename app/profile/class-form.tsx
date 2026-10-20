"use client";

import { useActionState } from "react";
import { updateOwnClass, type ProfileState } from "./actions";

const initialState: ProfileState = {};

export function ClassForm({
  classes,
  currentClassId,
}: {
  classes: { id: string; name: string }[];
  currentClassId: string | null;
}) {
  const [state, action, pending] = useActionState(updateOwnClass, initialState);

  return (
    <form action={action} className="grid gap-4">
      <div className="field">
        <label className="label" htmlFor="classId">
          Class
        </label>
        <select
          className="input"
          id="classId"
          name="classId"
          defaultValue={currentClassId ?? ""}
          required
        >
          <option value="" disabled>
            Choose your class
          </option>
          {classes.map((row) => (
            <option key={row.id} value={row.id}>
              {row.name}
            </option>
          ))}
        </select>
      </div>
      {state.error ? <p className="error-text">{state.error}</p> : null}
      {state.notice ? <p className="notice notice-success">{state.notice}</p> : null}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save class"}
      </button>
    </form>
  );
}
