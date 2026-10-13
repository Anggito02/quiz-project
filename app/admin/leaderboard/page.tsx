import { redirect } from "next/navigation";
import { LeaderboardView } from "@/components/leaderboard-view";
import { getSessionProfile } from "@/lib/session";

export default async function AdminLeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ quiz?: string; minutes?: string; course?: string; class?: string; reset?: string; error?: string }>;
}) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const { quiz, minutes, course, class: classId, reset, error } = await searchParams;
  const duration = Number(minutes);
  const notice =
    reset === "all"
      ? "All leaderboard scores were deleted."
      : reset === "board"
        ? "This leaderboard was reset."
        : undefined;
  const errorText =
    error === "confirm"
      ? "Confirm the checkbox before resetting scores."
      : error
        ? "Could not reset that leaderboard. Run the latest database migration, then try again."
        : undefined;

  return (
    <main className="page">
      <h1>Leaderboard</h1>
      <p className="lede mt-4">
        Review a board, then clear its scores. Use this to remove dummy results while testing.
      </p>
      {errorText ? <p className="error-text mt-4">{errorText}</p> : null}
      <LeaderboardView
        basePath="/admin/leaderboard"
        quizId={quiz}
        courseId={course}
        classId={classId}
        minutes={Number.isFinite(duration) ? duration : undefined}
        currentUserId={profile.id}
        showReset
        notice={notice}
      />
    </main>
  );
}
