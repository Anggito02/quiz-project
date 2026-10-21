import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LeaderboardView } from "@/components/leaderboard-view";
import { LeaderboardLoading } from "@/components/loading-frame";
import { getSessionProfile } from "@/lib/session";

type BoardParams = {
  quiz?: string;
  minutes?: string;
  course?: string;
  class?: string;
  reset?: string;
  error?: string;
};

async function AdminLeaderboardBoard({
  params,
  currentUserId,
}: {
  params: BoardParams;
  currentUserId: string;
}) {
  const duration = Number(params.minutes);
  const notice =
    params.reset === "all"
      ? "All leaderboard scores were deleted."
      : params.reset === "board"
        ? "This leaderboard was reset."
        : undefined;
  const errorText =
    params.error === "confirm"
      ? "Confirm the checkbox before resetting scores."
      : params.error
        ? "Could not reset that leaderboard. Run the latest database migration, then try again."
        : undefined;

  return (
    <main className="page">
      {errorText ? <p className="error-text">{errorText}</p> : null}
      <LeaderboardView
        basePath="/admin/leaderboard"
        quizId={params.quiz}
        courseId={params.course}
        classId={params.class}
        minutes={Number.isFinite(duration) ? duration : undefined}
        currentUserId={currentUserId}
        showReset
        notice={notice}
        intro="Review a board, then clear its scores. Use this to remove dummy results while testing."
      />
    </main>
  );
}

export default async function AdminLeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<BoardParams>;
}) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const params = await searchParams;

  return (
    <Suspense fallback={<LeaderboardLoading tone="light" />}>
      <AdminLeaderboardBoard params={params} currentUserId={profile.id} />
    </Suspense>
  );
}
