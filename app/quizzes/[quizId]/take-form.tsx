"use client";

import { useActionState, useState } from "react";
import { AnswerOptions } from "@/components/answer-options";
import { LearnerShell } from "@/components/learner-shell";
import { submitQuiz, type SubmitState } from "./actions";

type Question = {
  id: string;
  prompt: string;
  type: "single" | "multi";
  options: { id: string; label: string }[];
};

const initialState: SubmitState = {};

export function TakeQuizForm({ quizId, questions }: { quizId: string; questions: Question[] }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(submitQuiz, initialState);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const answered = questions.filter((question) => (answers[question.id] ?? []).length > 0).length;

  function setSingle(questionId: string, optionId: string) {
    setAnswers((current) => ({ ...current, [questionId]: [optionId] }));
  }

  function toggleMulti(questionId: string, optionId: string) {
    setAnswers((current) => {
      const selected = new Set(current[questionId] ?? []);
      if (selected.has(optionId)) selected.delete(optionId);
      else selected.add(optionId);
      return { ...current, [questionId]: [...selected] };
    });
  }

  if (!open) {
    return (
      <button className="btn btn-quiz" type="button" onClick={() => setOpen(true)}>
        Start quiz
      </button>
    );
  }

  return (
    <LearnerShell
      progress={questions.length ? answered / questions.length : 0}
      counter={`${answered} of ${questions.length} answered`}
      onExit={() => setOpen(false)}
    >
      <form action={action} className="learner-stage">
        <input type="hidden" name="quizId" value={quizId} />
        <input type="hidden" name="answers" value={JSON.stringify(answers)} />
        {questions.map((question, index) => (
          <fieldset className="question-panel" key={question.id}>
            <legend>
              {index + 1}. {question.prompt}
            </legend>
            <p className="learner-progress mt-3">
              {question.type === "single" ? "Choose one answer." : "Choose every correct answer."}
            </p>
            <AnswerOptions
              questionId={question.id}
              type={question.type}
              options={question.options}
              selected={answers[question.id] ?? []}
              onChange={(optionId) =>
                question.type === "single"
                  ? setSingle(question.id, optionId)
                  : toggleMulti(question.id, optionId)
              }
            />
          </fieldset>
        ))}
        {state.error ? <p className="error-text">{state.error}</p> : null}
        <button className="btn btn-quiz justify-self-start" type="submit" disabled={pending}>
          Submit quiz
        </button>
      </form>
    </LearnerShell>
  );
}
