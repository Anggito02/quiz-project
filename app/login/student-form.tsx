"use client";

import { useActionState, useMemo, useState } from "react";
import {
  listClassStudents,
  logInStudent,
  type ClassStudent,
  type LoginState,
} from "./actions";

const initialState: LoginState = {};

export function StudentLoginForm({ classes }: { classes: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(logInStudent, initialState);
  const [step, setStep] = useState<1 | 2>(1);
  const [classId, setClassId] = useState("");
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingClass, setLoadingClass] = useState(false);
  const onClass = step === 1;

  async function goToNames(nextClassId: string) {
    if (!nextClassId) {
      setLoadError("Choose a class.");
      return;
    }
    setLoadingClass(true);
    setLoadError(null);
    const result = await listClassStudents(nextClassId);
    setLoadingClass(false);
    if ("error" in result) {
      setLoadError(result.error);
      return;
    }
    if (result.students.length === 0) {
      setLoadError("No students in that class yet. Ask the administrator to import the class list.");
      return;
    }
    setClassId(nextClassId);
    setStudents(result.students);
    setStep(2);
  }

  return (
    <form
      action={action}
      className="card grid gap-4"
      onSubmit={(event) => {
        if (!onClass) return;
        event.preventDefault();
        const form = event.currentTarget;
        const nextClassId = String(new FormData(form).get("classId") ?? "");
        void goToNames(nextClassId);
      }}
    >
      <p className="muted text-center">Step {step} of 2</p>
      <div className="auth-steps" aria-hidden="true">
        <span className={onClass ? "auth-step-dot is-active" : "auth-step-dot"} />
        <span className={onClass ? "auth-step-dot" : "auth-step-dot is-active"} />
      </div>

      {onClass ? (
        <div className="grid gap-4">
          <div className="field">
            <label className="label" htmlFor="classId">
              Class
            </label>
            <select className="input" id="classId" name="classId" defaultValue={classId} required>
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
          {loadError ? <p className="error-text">{loadError}</p> : null}
          <button className="btn btn-primary" type="submit" disabled={loadingClass || classes.length === 0}>
            {loadingClass ? "Loading…" : "Next"}
          </button>
        </div>
      ) : (
        <NamePinFields students={students} pending={pending} error={state.error} onBack={() => setStep(1)} />
      )}
    </form>
  );
}

function NamePinFields({
  students,
  pending,
  error,
  onBack,
}: {
  students: ClassStudent[];
  pending: boolean;
  error?: string;
  onBack: () => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<ClassStudent | null>(null);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return students;
    return students.filter((row) => row.displayName.toLowerCase().includes(needle));
  }, [query, students]);

  function choose(row: ClassStudent) {
    setSelected(row);
    setQuery(row.displayName);
    setOpen(false);
  }

  return (
    <div className="grid gap-4">
      <div className="field">
        <label className="label" htmlFor="studentSearch">
          Name
        </label>
        <div className="combobox">
          <input type="hidden" name="studentNumber" value={selected?.studentNumber ?? ""} />
          <input
            className="input"
            id="studentSearch"
            type="search"
            role="combobox"
            autoComplete="off"
            aria-expanded={open}
            aria-controls="student-list"
            aria-autocomplete="list"
            placeholder="Search your name"
            value={query}
            required
            onChange={(event) => {
              setQuery(event.target.value);
              setSelected(null);
              setOpen(true);
              setActive(0);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setOpen(false), 120);
            }}
            onKeyDown={(event) => {
              if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
                setOpen(true);
                return;
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((index) => Math.min(index + 1, Math.max(matches.length - 1, 0)));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((index) => Math.max(index - 1, 0));
              } else if (event.key === "Enter" && matches[active]) {
                event.preventDefault();
                choose(matches[active]);
              } else if (event.key === "Escape") {
                setOpen(false);
              }
            }}
          />
          {open ? (
            <ul className="combobox-list" id="student-list" role="listbox">
              {matches.length === 0 ? (
                <li className="combobox-empty">No matching name</li>
              ) : (
                matches.map((row, index) => (
                  <li key={row.id} role="option" aria-selected={selected?.id === row.id}>
                    <button
                      className={index === active ? "combobox-option is-active" : "combobox-option"}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => choose(row)}
                    >
                      {row.displayName}
                    </button>
                  </li>
                ))
              )}
            </ul>
          ) : null}
        </div>
      </div>
      <div className="field">
        <label className="label" htmlFor="pin">
          PIN
        </label>
        <input
          className="input"
          id="pin"
          name="pin"
          inputMode="numeric"
          autoComplete="off"
          pattern="\d{6}"
          maxLength={6}
          required
        />
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      <div className="auth-step-actions">
        <button className="btn btn-ghost" type="button" disabled={pending} onClick={onBack}>
          Back
        </button>
        <button className="btn btn-primary" type="submit" disabled={pending || !selected} aria-busy={pending}>
          {pending ? "Logging in…" : "Log in"}
        </button>
      </div>
    </div>
  );
}
