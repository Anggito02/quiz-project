"use client";

import { useId } from "react";

const CONFETTI = [
  { left: "16%", delay: "0s", color: "#ff5d8f" },
  { left: "30%", delay: "0.45s", color: "#7af0ff" },
  { left: "48%", delay: "0.9s", color: "#ffe56a" },
  { left: "64%", delay: "0.2s", color: "#b5ff4d" },
  { left: "78%", delay: "1.3s", color: "#c084fc" },
];

export function TrophyBadge({ rank, muted = false }: { rank?: number; muted?: boolean }) {
  const rawId = useId().replace(/:/g, "");
  const cup = `cup-${rawId}`;
  const shine = `shine-${rawId}`;

  return (
    <div className={muted ? "trophy-badge is-muted" : "trophy-badge"} aria-hidden="true">
      <div className="trophy-burst" />
      <div className="trophy-ring" />
      <div className="trophy-confetti">
        {CONFETTI.map((piece) => (
          <span
            key={piece.left}
            style={{ left: piece.left, background: piece.color, animationDelay: piece.delay }}
          />
        ))}
      </div>
      <span className="trophy-spark" style={{ top: "14%", left: "16%" }} />
      <span className="trophy-spark" style={{ top: "20%", right: "12%", animationDelay: "0.7s" }} />
      <span className="trophy-spark" style={{ bottom: "16%", left: "10%", animationDelay: "1.2s" }} />
      <svg className="trophy-svg" viewBox="0 0 80 80">
        <defs>
          <linearGradient id={cup} x1="16" y1="8" x2="64" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff1c2" />
            <stop offset="0.42" stopColor="#f0b429" />
            <stop offset="1" stopColor="#b87410" />
          </linearGradient>
          <linearGradient id={shine} x1="28" y1="14" x2="40" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M22 16h36v16c0 12-7 22-18 24-11-2-18-12-18-24V16z"
          fill={`url(#${cup})`}
        />
        <path d="M22 20h8c0 10 2 16 8 20-8-1-14-8-16-20z" fill={`url(#${shine})`} />
        <path
          d="M22 20H12c0 10 6 16 12 16M58 20h10c0 10-6 16-12 16"
          fill="none"
          stroke="#e2a21a"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path d="M34 56h12v6H34z" fill="#d59a1a" />
        <path d="M26 64h28v6H26z" fill="#f0c14b" />
        <path d="M22 70h36v4H22z" fill="#c98416" />
        {rank != null ? (
          <text
            x="40"
            y="40"
            textAnchor="middle"
            fill="#7a4b00"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontSize="16"
            fontWeight="800"
          >
            {rank}
          </text>
        ) : null}
      </svg>
    </div>
  );
}

export function TrophyBoard() {
  return (
    <svg className="trophy-board" viewBox="0 0 92 84" aria-hidden="true">
      <rect x="40" y="18" width="44" height="52" rx="6" fill="#2a2158" stroke="#e6b325" strokeWidth="2" />
      <path d="M50 32h24M50 42h18M50 52h22" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <path d="M18 28h22v14c0 8-4 14-11 16-7-2-11-8-11-16V28z" fill="#f0b429" />
      <path d="M18 32H12c0 6 3 10 7 10M40 32h6c0 6-3 10-7 10" fill="none" stroke="#e2a21a" strokeWidth="2" />
      <path d="M24 58h10v4H24zM20 64h18v4H20z" fill="#d59a1a" />
      <circle cx="29" cy="74" r="3" fill="#c084fc" />
      <circle cx="70" cy="74" r="3" fill="#7af0ff" />
    </svg>
  );
}
