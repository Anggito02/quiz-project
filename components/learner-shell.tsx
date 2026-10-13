"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AmbientBackdrop } from "./ambient-backdrop";
import { KuisMark } from "./kuis-mark";

export function LearnerShell({
  progress,
  counter,
  timer,
  timerLow = false,
  onExit,
  exitLabel = "Exit",
  children,
}: {
  progress: number;
  counter: string;
  timer?: string;
  timerLow?: boolean;
  onExit: () => void;
  exitLabel?: string;
  children: React.ReactNode;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const width = `${Math.max(0, Math.min(100, progress * 100))}%`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = document.querySelector(".app-frame, .marketing-frame");
    if (frame instanceof HTMLElement) frame.inert = true;
    shellRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
      if (frame instanceof HTMLElement) frame.inert = false;
    };
  }, [mounted]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onExit();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="learner-shell"
      ref={shellRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Quiz"
    >
      <AmbientBackdrop />
      <header className="learner-topbar">
        <KuisMark size={36} />
        <div className="learner-progress-track" aria-hidden="true">
          <div className="learner-progress-fill" style={{ width }} />
        </div>
        <p className="learner-meta">
          <span className="learner-counter">{counter}</span>
          {timer ? (
            <span className={timerLow ? "learner-timer is-low" : "learner-timer"}>{timer}</span>
          ) : null}
        </p>
        <button className="btn btn-ghost btn-sm" type="button" onClick={onExit}>
          {exitLabel}
        </button>
      </header>
      <div className="learner-main">{children}</div>
    </div>,
    document.body,
  );
}
