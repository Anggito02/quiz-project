"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnswerOptions } from "@/components/answer-options";
import { LearnerShell } from "@/components/learner-shell";
import { submitUnlimited, type UnlimitedState } from "../actions";

type Question = {
  id: string;
  prompt: string;
  type: "single" | "multi";
  options: { id: string; label: string }[];
};

const initialState: UnlimitedState = {};

export function UnlimitedPlayForm({
  sessionId,
  endsAt,
  questions,
}: {
  sessionId: string;
  endsAt: string;
  questions: Question[];
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(submitUnlimited, initialState);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, new Date(endsAt).getTime() - Date.now()),
  );
  const question = questions[index];
  const answersRef = useRef(answers);
  const questionIdRef = useRef(question?.id);
  const formRef = useRef<HTMLFormElement>(null);
  const sent = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    questionIdRef.current = question?.id;
  }, [question]);

  function includeCurrent() {
    const questionId = questionIdRef.current;
    if (!questionId || questionId in answersRef.current) return;
    answersRef.current = { ...answersRef.current, [questionId]: [] };
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = Math.max(0, new Date(endsAt).getTime() - Date.now());
      setRemaining(next);
      if (next === 0 && !sent.current) {
        sent.current = true;
        includeCurrent();
        formRef.current?.requestSubmit();
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [endsAt]);

  function remember(questionId: string, optionIds: string[]) {
    setAnswers((current) => {
      const next = { ...current, [questionId]: optionIds };
      answersRef.current = next;
      return next;
    });
  }

  if (!question) {
    return (
      <LearnerShell progress={0} counter="No questions" onExit={() => router.push("/unlimited")}>
        <p className="learner-stage">There are no questions in this run.</p>
      </LearnerShell>
    );
  }

  const selected = answers[question.id] ?? [];
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const timerLow = remaining < 60000;
  const clock = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <LearnerShell
      progress={questions.length ? (index + 1) / questions.length : 0}
      counter={`Question ${index + 1} of ${questions.length}`}
      timer={timerLow ? `${clock} · Less than a minute left` : clock}
      timerLow={timerLow}
      onExit={() => router.push("/unlimited")}
    >
      <form
        ref={formRef}
        className="learner-stage"
        action={(formData) => {
          formData.set("answers", JSON.stringify(answersRef.current));
          return action(formData);
        }}
      >
        <input type="hidden" name="sessionId" value={sessionId} />
        <fieldset className="question-panel">
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
            selected={selected}
            onChange={(optionId) => {
              if (question.type === "single") {
                remember(question.id, [optionId]);
                return;
              }
              const next = new Set(selected);
              if (next.has(optionId)) next.delete(optionId);
              else next.add(optionId);
              remember(question.id, [...next]);
            }}
          />
        </fieldset>
        {state.error ? <p className="error-text">{state.error}</p> : null}
        <div className="flex flex-wrap gap-3">
          {index < questions.length - 1 ? (
            <button
              className="btn btn-quiz"
              type="button"
              onClick={() => {
                if (!(question.id in answersRef.current)) remember(question.id, selected);
                setIndex((current) => current + 1);
              }}
            >
              Next question
            </button>
          ) : null}
          <button
            className={index < questions.length - 1 ? "btn btn-ghost" : "btn btn-quiz"}
            type="submit"
            disabled={pending}
            onClick={includeCurrent}
          >
            Finish
          </button>
        </div>
      </form>
    </LearnerShell>
  );
}
