import { resetLeaderboard } from "./actions";

export function ResetBoardForms({
  quizId,
  minutes,
}: {
  quizId?: string;
  minutes?: number;
}) {
  return (
    <div className="mt-10 grid gap-4">
      {quizId ? (
        <form action={resetLeaderboard} className="card grid max-w-xl gap-4">
          <h2>Reset this board</h2>
          <p className="lede">
            This deletes submitted scores for this quiz, including every saved attempt. The quiz
            itself stays.
          </p>
          <input type="hidden" name="scope" value="quiz" />
          <input type="hidden" name="quizId" value={quizId} />
          <label className="flex items-start gap-3">
            <input type="checkbox" name="confirm" required />
            <span>I understand this deletes submitted scores for this board.</span>
          </label>
          <button className="btn btn-danger justify-self-start" type="submit">
            Reset this board
          </button>
        </form>
      ) : (
        <form action={resetLeaderboard} className="card grid max-w-xl gap-4">
          <h2>Reset this board</h2>
          <p className="lede">
            This deletes {minutes} minute Unlimited runs, including runs still in progress. Other
            time limits stay.
          </p>
          <input type="hidden" name="scope" value="unlimited" />
          <input type="hidden" name="minutes" value={minutes} />
          <label className="flex items-start gap-3">
            <input type="checkbox" name="confirm" required />
            <span>I understand this deletes submitted scores for this board.</span>
          </label>
          <button className="btn btn-danger justify-self-start" type="submit">
            Reset this board
          </button>
        </form>
      )}
      <form action={resetLeaderboard} className="card grid max-w-xl gap-4">
        <h2>Reset all leaderboards</h2>
        <p className="lede">
          This deletes every quiz attempt and every Unlimited run. Quizzes, questions, and accounts
          stay.
        </p>
        <input type="hidden" name="scope" value="all" />
        <label className="flex items-start gap-3">
          <input type="checkbox" name="confirm" required />
          <span>I understand this deletes every submitted score.</span>
        </label>
        <button className="btn btn-danger justify-self-start" type="submit">
          Reset all leaderboards
        </button>
      </form>
    </div>
  );
}
