import { Calendar, Medal, Trophy, User } from "lucide-react";
import { TrophyBoard } from "./trophy";

export type LeaderboardEntry = {
  rank: number;
  studentId: string;
  displayName: string;
  value: string;
  submittedAt: string;
};

export function formatWhen(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

function RankCell({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="rank-mark is-gold" aria-label="Rank 1">
        <Trophy aria-hidden="true" size={16} />
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="rank-mark is-silver" aria-label="Rank 2">
        <Medal aria-hidden="true" size={16} />
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="rank-mark is-bronze" aria-label="Rank 3">
        <Medal aria-hidden="true" size={16} />
      </span>
    );
  }
  return <span className="rank-mark">{rank}</span>;
}

export function LeaderboardTable({
  entries,
  currentUserId,
  valueHeading,
  summary = "Best score for each student. The top 100 are shown.",
  showHeading = true,
  showStatus = true,
  showSummary = true,
}: {
  entries: LeaderboardEntry[];
  currentUserId: string;
  valueHeading: string;
  summary?: string;
  showHeading?: boolean;
  showStatus?: boolean;
  showSummary?: boolean;
}) {
  const mine = entries.find((entry) => entry.studentId === currentUserId);

  return (
    <section className="mt-6">
      {showHeading ? <h2>Leaderboard</h2> : null}
      {showStatus && entries.length > 0 ? (
        <p className={`notice mt-4 ${mine ? "notice-success" : "notice-warning"}`}>
          {mine
            ? `You are on the leaderboard. Rank ${mine.rank}.`
            : "You are not on the leaderboard."}
        </p>
      ) : null}
      {entries.length === 0 ? (
        <div className="empty-board">
          <TrophyBoard />
          <div>
            <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>No scores yet.</p>
            {showSummary ? <p className="muted mt-1">{summary}</p> : null}
          </div>
        </div>
      ) : (
        <>
          {showSummary ? <p className="lede mt-4">{summary}</p> : null}
          <div className="table-wrap mt-4">
            <table className="table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>{valueHeading}</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    className={entry.studentId === currentUserId ? "is-you" : undefined}
                    key={`${entry.rank}-${entry.studentId}`}
                  >
                    <td>
                      <RankCell rank={entry.rank} />
                    </td>
                    <td>
                      <span className="name-cell">
                        <span className="name-avatar">
                          <User aria-hidden="true" size={14} />
                        </span>
                        {entry.displayName}
                      </span>
                    </td>
                    <td>{entry.value}</td>
                    <td>
                      <span className="when-cell">
                        <Calendar aria-hidden="true" size={14} />
                        {formatWhen(entry.submittedAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
