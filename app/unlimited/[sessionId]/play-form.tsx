"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
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
  const [state, action, pending] = useActionState(submitUnlimited, initialState);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, new Date(endsAt).getTime() - Date.now()),
  );
  const [timeUp, setTimeUp] = useState(false);
  const question = questions[index];
  const answersRef = useRef(answers);
  const questionIdRef = useRef(question?.id);
  const formRef = useRef<HTMLFormElement>(null);
  const sent = useRef(false);
  const armed = useRef(false);
  const showTimeUp = timeUp && !state.error;

  useEffect(() => {
    if (!state.error) return;
    sent.current = false;
    armed.current = false;
  }, [state.error]);

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
    const deadline = new Date(endsAt).getTime();
    let tickTimer = 0;
    let submitTimer = 0;

    // Wake when the displayed second changes, not on a fixed interval.
    const delayFor = (left: number) => (left > 0 ? (left % 1000 || 1000) + 5 : 0);

    function tick() {
      const next = Math.max(0, deadline - Date.now());
      setRemaining(next);
      if (next > 0) {
        tickTimer = window.setTimeout(tick, delayFor(next));
        return;
      }
      if (armed.current || sent.current) return;
      armed.current = true;
      setTimeUp(true);
      submitTimer = window.setTimeout(() => {
        const questionId = questionIdRef.current;
        if (questionId && !(questionId in answersRef.current)) {
          answersRef.current = { ...answersRef.current, [questionId]: [] };
        }
        formRef.current?.requestSubmit();
      }, 2500);
    }

    tickTimer = window.setTimeout(tick, delayFor(Math.max(0, deadline - Date.now())));
    return () => {
      window.clearTimeout(tickTimer);
      window.clearTimeout(submitTimer);
    };
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
      <LearnerShell progress={0} counter="No questions">
        <div className="learner-stage">
          <p>There are no questions in this run.</p>
          <Link className="btn btn-ghost justify-self-start" href="/unlimited">
            Back to Unlimited
          </Link>
        </div>
      </LearnerShell>
    );
  }

  const selected = answers[question.id] ?? [];
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const timerLow = remaining < 60000 && !showTimeUp;
  const clock = showTimeUp
    ? "00:00"
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <LearnerShell
      progress={questions.length ? (index + 1) / questions.length : 0}
      counter={`Question ${index + 1} of ${questions.length}`}
      timer={timerLow ? `${clock} · Less than a minute left` : clock}
      timerLow={timerLow}
    >
      <form
        ref={formRef}
        className="learner-stage"
        action={(formData) => {
          if (sent.current) return;
          sent.current = true;
          formData.set("answers", JSON.stringify(answersRef.current));
          return action(formData);
        }}
      >
        <input type="hidden" name="sessionId" value={sessionId} />
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
            selected={selected}
            disabled={showTimeUp || pending}
            onChange={(optionId) => {
              if (showTimeUp) return;
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
        </div>
        {state.error ? <p className="error-text">{state.error}</p> : null}
        <div className="flex flex-wrap gap-3">
          {index < questions.length - 1 ? (
            <button
              className="btn btn-quiz"
              type="button"
              disabled={showTimeUp || pending}
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
            disabled={pending || showTimeUp}
            onClick={includeCurrent}
          >
            Finish
          </button>
        </div>
      </form>
      {showTimeUp ? (
        <div className="timeup" role="status" aria-live="assertive">
          <p className="timeup-title">Time&apos;s up!</p>
        </div>
      ) : null}
    </LearnerShell>
  );
}
