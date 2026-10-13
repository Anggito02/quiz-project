"use client";

import { useActionState } from "react";
import { importQuestions, type EditorState } from "./actions";

const initialState: EditorState = {};

export function ImportQuestionsForm({ quizId }: { quizId: string }) {
  const [state, action, pending] = useActionState(importQuestions, initialState);

  return (
    <div className="mt-4 grid max-w-xl gap-4">
      <p>
        <a className="btn btn-admin btn-sm" href="/admin/quizzes/template">
          Download template
        </a>
      </p>
      <form action={action} className="card grid gap-4">
        <input type="hidden" name="quizId" value={quizId} />
        <div className="field">
          <label className="label" htmlFor="quiz-excel">
            Excel file
          </label>
          <input
            className="input"
            id="quiz-excel"
            name="file"
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            required
          />
        </div>
        {state.error ? <p className="error-text whitespace-pre-line">{state.error}</p> : null}
        {state.notice ? <p className="notice">{state.notice}</p> : null}
        <button className="btn btn-admin" type="submit" disabled={pending}>
          Import questions
        </button>
      </form>
    </div>
  );
}
