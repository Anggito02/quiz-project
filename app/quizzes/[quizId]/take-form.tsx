"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { AnswerOptions } from "@/components/answer-options";
import { LearnerShell } from "@/components/learner-shell";
import { QuestionJumpMenu } from "@/components/question-jump-menu";
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
  const [state, formAction, pending] = useActionState(submitQuiz, initialState);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitReady, setSubmitReady] = useState(false);
  const question = questions[index];
  const isLast = index >= questions.length - 1;

  useEffect(() => {
    if (!isLast) {
      setSubmitReady(false);
      return;
    }
    // Next on Q19 and Submit on Q20 share the same spot — block the follow-up click.
    setSubmitReady(false);
    const timer = window.setTimeout(() => setSubmitReady(true), 500);
    return () => window.clearTimeout(timer);
  }, [isLast, index]);

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

  function goTo(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= questions.length || nextIndex === index) return;
    setIndex(nextIndex);
  }

  function submitNow() {
    if (pending || !submitReady) return;
    const formData = new FormData();
    formData.set("quizId", quizId);
    formData.set("answers", JSON.stringify(answers));
    startTransition(() => {
      formAction(formData);
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
      toolbar={
        <QuestionJumpMenu
          currentIndex={index}
          onJump={goTo}
          items={questions.map((item) => ({
            id: item.id,
            answered: (answers[item.id] ?? []).length > 0,
          }))}
        />
      }
    >
      <div className="learner-stage">
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
          <button
            className="btn btn-ghost"
            type="button"
            disabled={index === 0 || pending}
            onClick={() => goTo(index - 1)}
          >
            Previous
          </button>
          {!isLast ? (
            <button
              className="btn btn-quiz"
              type="button"
              disabled={pending}
              onClick={() => goTo(index + 1)}
            >
              Next question
            </button>
          ) : (
            <button
              className="btn btn-quiz"
              type="button"
              disabled={pending || !submitReady}
              aria-busy={pending}
              onClick={submitNow}
            >
              {pending ? "Submitting…" : "Submit quiz"}
            </button>
          )}
        </div>
      </div>
    </LearnerShell>
  );
}
