"use client";

import { ChevronDown, ListOrdered } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

type JumpItem = {
  id: string;
  answered: boolean;
};

export function QuestionJumpMenu({
  items,
  currentIndex,
  onJump,
}: {
  items: JumpItem[];
  currentIndex: number;
  onJump: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const answeredCount = items.filter((item) => item.answered).length;

  useEffect(() => {
    if (!open) return;

    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    // Capture after the button click finishes so outside-dismiss does not race.
    const timer = window.setTimeout(() => {
      window.addEventListener("pointerdown", onPointer);
      window.addEventListener("keydown", onKey);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="question-jump-menu" ref={rootRef}>
      <button
        type="button"
        className="question-jump-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        aria-label={`Question list, ${answeredCount} of ${items.length} answered`}
        title="Open question list"
        onClick={() => setOpen((value) => !value)}
      >
        <ListOrdered aria-hidden="true" size={16} strokeWidth={2.25} />
        <span className="question-jump-toggle-label">Question list</span>
        <span className="question-jump-toggle-count">
          {answeredCount}/{items.length}
        </span>
        <ChevronDown
          aria-hidden="true"
          className="question-jump-toggle-caret"
          size={16}
          strokeWidth={2.25}
        />
      </button>
      {open ? (
        <div className="question-jump-panel" id={panelId} role="dialog" aria-label="Question list">
          <p className="question-jump-panel-title">Question list</p>
          <p className="question-jump-panel-hint">
            Tap a number to jump to that question. Progress: {answeredCount}/{items.length} answered.
          </p>
          <div className="question-jump-legend" aria-hidden="true">
            <span className="is-current">
              <i /> Current
            </span>
            <span className="is-answered">
              <i /> Answered
            </span>
            <span>
              <i /> Unanswered
            </span>
          </div>
          <div className="question-jump-grid">
            {items.map((item, questionIndex) => {
              const current = questionIndex === currentIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`question-jump-btn${current ? " is-current" : ""}${item.answered ? " is-answered" : ""}`}
                  aria-current={current ? "step" : undefined}
                  aria-label={`Go to question ${questionIndex + 1}${item.answered ? ", answered" : ", unanswered"}`}
                  onClick={() => {
                    onJump(questionIndex);
                    setOpen(false);
                  }}
                >
                  {questionIndex + 1}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
