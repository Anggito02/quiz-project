"use client";

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

    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
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
        onClick={() => setOpen((value) => !value)}
      >
        Questions
        <span className="question-jump-toggle-count">
          {answeredCount}/{items.length}
        </span>
      </button>
      {open ? (
        <div className="question-jump-panel" id={panelId} role="dialog" aria-label="Jump to question">
          <p className="question-jump-panel-title">Jump to question</p>
          <div className="question-jump-grid">
            {items.map((item, questionIndex) => {
              const current = questionIndex === currentIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`question-jump-btn${current ? " is-current" : ""}${item.answered ? " is-answered" : ""}`}
                  aria-current={current ? "step" : undefined}
                  aria-label={`Question ${questionIndex + 1}${item.answered ? ", answered" : ""}`}
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
