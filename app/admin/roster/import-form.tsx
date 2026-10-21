"use client";

import { useActionState } from "react";
import { importStudents, type RosterState } from "./actions";

const initialState: RosterState = {};

export function ImportStudentsForm() {
  const [state, action, pending] = useActionState(importStudents, initialState);

  return (
    <form action={action} className="card mt-8 grid max-w-xl gap-4">
      <div className="field">
        <label className="label" htmlFor="serdik-excel">
          Student Excel file
        </label>
        <input
          className="input"
          id="serdik-excel"
          name="file"
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          required
        />
        <p className="muted">
          Use sheets with columns Nomor Siswa, Nama Siswa, Kelas, and PIN. Importing updates names,
          classes, and PINs.
        </p>
      </div>
      {state.error ? <p className="error-text whitespace-pre-line">{state.error}</p> : null}
      {state.notice ? <p className="notice notice-success">{state.notice}</p> : null}
      <button className="btn btn-admin" type="submit" disabled={pending}>
        {pending ? "Importing…" : "Import students"}
      </button>
    </form>
  );
}
