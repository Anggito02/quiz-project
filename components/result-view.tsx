import { PendingLink } from "./pending-link";
import { LeaderboardTable, type LeaderboardEntry } from "./leaderboard-table";
import { TrophyBadge } from "./trophy";

export function ResultView({
  actions,
  correct,
  incorrect,
  badge,
  caption,
  entries,
  currentUserId,
  valueHeading,
  summary,
}: {
  actions: { href: string; label: string }[];
  correct: number;
  incorrect: number;
  badge: string;
  caption: string;
  entries: LeaderboardEntry[];
  currentUserId: string;
  valueHeading: string;
  summary: string;
}) {
  const total = correct + incorrect;
  const correctShare = total === 0 ? 0 : (correct / total) * 100;
  const badgeLeft = Math.min(92, Math.max(8, total === 0 ? 50 : correctShare));
  const mine = entries.find((entry) => entry.studentId === currentUserId);

  return (
    <main className="page">
      <div className="board-stack">
        <p className="flex flex-wrap gap-3">
          {actions.map((action) => (
            <PendingLink className="btn btn-ghost" href={action.href} key={action.href}>
              {action.label}
            </PendingLink>
          ))}
        </p>
        <section className="board-panel">
          <h1>Result</h1>
          <div
            className="score-bar"
            role="img"
            aria-label={`${correct} correct, ${incorrect} incorrect`}
          >
            {correctShare > 0 ? (
              <div className="score-bar-correct" style={{ width: `${correctShare}%` }} />
            ) : null}
            {correctShare < 100 ? (
              <div className="score-bar-incorrect" style={{ width: `${100 - correctShare}%` }} />
            ) : null}
            <span className="score-badge" style={{ left: `${badgeLeft}%` }}>
              {badge}
            </span>
          </div>
          <div className="result-meta">
            <p className="badge badge-success">{correct} Correct</p>
            <p className="badge badge-error">{incorrect} Incorrect</p>
          </div>
          <p className="muted mt-3">{caption}</p>
        </section>
        <section className="board-panel">
          <h2>Leaderboard</h2>
          <div className="board-hero">
            <TrophyBadge rank={mine?.rank} muted={!mine} />
            <p className={mine ? "board-status" : "board-status is-out"}>
              {mine
                ? `You are on the leaderboard! Rank ${mine.rank}.`
                : "You are not on the leaderboard."}
            </p>
          </div>
          <p className="lede mt-4" style={{ marginInline: "auto", textAlign: "center" }}>
            {summary}
          </p>
          <LeaderboardTable
            entries={entries}
            currentUserId={currentUserId}
            valueHeading={valueHeading}
            showHeading={false}
            showStatus={false}
            showSummary={false}
          />
        </section>
      </div>
    </main>
  );
}
