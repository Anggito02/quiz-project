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
  const [index, setIndex] = useState(0);
  const [state, action, pending] = useActionState(submitQuiz, initialState);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const question = questions[index];

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
      <button className="btn btn-quiz quiz-start" type="button" onClick={() => setOpen(true)}>
        Start quiz
      </button>
    );
  }

  return (
    <LearnerShell
      progress={questions.length ? (index + 1) / questions.length : 0}
      counter={`Question ${index + 1} of ${questions.length}`}
    >
      <form action={action} className="learner-stage">
        <input type="hidden" name="quizId" value={quizId} />
        <input type="hidden" name="answers" value={JSON.stringify(answers)} />
        {question ? (
          <div className="question-panel" role="group" aria-labelledby={`q-${question.id}`}>
            <h2 className="question-title" id={`q-${question.id}`}>
              {index + 1}. {question.prompt}
            </h2>
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
          </div>
        ) : null}
        {state.error ? <p className="error-text">{state.error}</p> : null}
        <div className="flex flex-wrap gap-3">
          {index < questions.length - 1 ? (
            <button className="btn btn-quiz" type="button" onClick={() => setIndex((current) => current + 1)}>
              Next question
            </button>
          ) : (
            <button className="btn btn-quiz" type="submit" disabled={pending}>
              Submit quiz
            </button>
          )}
        </div>
      </form>
    </LearnerShell>
  );
}
