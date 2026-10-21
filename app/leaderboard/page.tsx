import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LeaderboardView } from "@/components/leaderboard-view";
import { LeaderboardLoading } from "@/components/loading-frame";
import { getSessionProfile } from "@/lib/session";

type BoardParams = { quiz?: string; minutes?: string; course?: string; class?: string };

async function LeaderboardBoard({
  params,
  currentUserId,
}: {
  params: BoardParams;
  currentUserId: string;
}) {
  const duration = Number(params.minutes);

  return (
    <main className="page">
      <LeaderboardView
        basePath="/leaderboard"
        quizId={params.quiz}
        courseId={params.course}
        classId={params.class}
        minutes={Number.isFinite(duration) ? duration : undefined}
        currentUserId={currentUserId}
      />
    </main>
  );
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<BoardParams>;
}) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const params = await searchParams;

  return (
    <Suspense fallback={<LeaderboardLoading />}>
      <LeaderboardBoard params={params} currentUserId={profile.id} />
    </Suspense>
  );
}
