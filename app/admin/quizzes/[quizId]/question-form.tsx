"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import type { OptionDraft, QuestionType } from "@/lib/quiz-validation";
import { saveQuestion, type EditorState } from "./actions";

const initialState: EditorState = {};

function blankOptions(): OptionDraft[] {
  return [
    { label: "", isCorrect: false },
    { label: "", isCorrect: false },
  ];
}

export function QuestionForm({
  quizId,
  questionId,
  initialPrompt = "",
  initialType = "single",
  initialOptions,
  submitLabel,
}: {
  quizId: string;
  questionId?: string;
  initialPrompt?: string;
  initialType?: QuestionType;
  initialOptions?: OptionDraft[];
  submitLabel: string;
}) {
  const [state, action, pending] = useActionState(saveQuestion, initialState);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [type, setType] = useState<QuestionType>(initialType);
  const [options, setOptions] = useState<OptionDraft[]>(initialOptions ?? blankOptions());
  const fieldId = questionId ?? "new";

  useEffect(() => {
    if (!state.saved || questionId) return;
    setPrompt("");
    setType("single");
    setOptions(blankOptions());
  }, [state.saved, questionId]);

  function setQuestionType(next: QuestionType) {
    setType(next);
    if (next === "single") {
      setOptions((current) => {
        const firstCorrect = current.findIndex((option) => option.isCorrect);
        return current.map((option, index) => ({
          ...option,
          isCorrect: index === firstCorrect,
        }));
      });
    }
  }

  function toggleCorrect(index: number) {
    setOptions((current) =>
      current.map((option, optionIndex) => {
        if (type === "single") {
          return { ...option, isCorrect: optionIndex === index ? !option.isCorrect : false };
        }
        if (optionIndex === index) return { ...option, isCorrect: !option.isCorrect };
        return option;
      }),
    );
  }

  return (
    <form action={action} className="card grid gap-4">
      <input type="hidden" name="quizId" value={quizId} />
      {questionId ? <input type="hidden" name="questionId" value={questionId} /> : null}
      <input type="hidden" name="options" value={JSON.stringify(options)} />
      <div className="field">
        <label className="label" htmlFor={`prompt-${fieldId}`}>
          Prompt
        </label>
        <textarea
          className="input"
          id={`prompt-${fieldId}`}
          name="prompt"
          rows={3}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          required
        />
      </div>
      <div className="field">
        <label className="label" htmlFor={`type-${fieldId}`}>
          Type
        </label>
        <select
          className="input"
          id={`type-${fieldId}`}
          name="type"
          value={type}
          onChange={(event) => setQuestionType(event.target.value as QuestionType)}
        >
          <option value="single">Single-answer</option>
          <option value="multi">Multi-select</option>
        </select>
      </div>
      <fieldset className="grid gap-3">
        <legend className="label">Options</legend>
        {options.map((option, index) => (
          <div className="flex flex-wrap items-center gap-3" key={index}>
            <input
              className="input min-w-0 flex-1"
              aria-label={`Option ${index + 1}`}
              value={option.label}
              onChange={(event) =>
                setOptions((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, label: event.target.value } : item,
                  ),
                )
              }
            />
            <label className="label flex items-center gap-2">
              <input
                type="checkbox"
                checked={option.isCorrect}
                onChange={() => toggleCorrect(index)}
              />
              Correct
            </label>
            {options.length > 2 ? (
              <button
                className="btn btn-admin btn-sm"
                type="button"
                onClick={() => setOptions((current) => current.filter((_, itemIndex) => itemIndex !== index))}
              >
                Remove
              </button>
            ) : null}
          </div>
        ))}
        <button
          className="btn btn-admin btn-sm justify-self-start"
          type="button"
          onClick={() => setOptions((current) => [...current, { label: "", isCorrect: false }])}
        >
          Add option
        </button>
      </fieldset>
      {state.error ? <p className="error-text">{state.error}</p> : null}
      {state.notice && !questionId ? <p className="notice">{state.notice}</p> : null}
      <button className="btn btn-admin justify-self-start" type="submit" disabled={pending}>
        {submitLabel}
      </button>
    </form>
  );
}
