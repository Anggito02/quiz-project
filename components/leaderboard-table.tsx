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

export function LeaderboardTable({
  entries,
  currentUserId,
  valueHeading,
  summary = "Best score for each student. The top 100 are shown.",
}: {
  entries: LeaderboardEntry[];
  currentUserId: string;
  valueHeading: string;
  summary?: string;
}) {
  const mine = entries.find((entry) => entry.studentId === currentUserId);

  return (
    <section className="mt-8">
      <h2>Leaderboard</h2>
      <p className={`notice mt-4 ${mine ? "notice-success" : "notice-warning"}`}>
        {mine
          ? `You are on the leaderboard. Rank ${mine.rank}.`
          : "You are not on the leaderboard."}
      </p>
      <p className="lede mt-4">{summary}</p>
      {entries.length === 0 ? (
        <p className="mt-8">No scores yet.</p>
      ) : (
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
                  <td>{entry.rank}</td>
                  <td>{entry.displayName}</td>
                  <td>{entry.value}</td>
                  <td>{formatWhen(entry.submittedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
