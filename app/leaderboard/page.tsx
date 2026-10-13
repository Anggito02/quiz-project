import { redirect } from "next/navigation";
import { LeaderboardView } from "@/components/leaderboard-view";
import { getSessionProfile } from "@/lib/session";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ quiz?: string; minutes?: string; course?: string; class?: string }>;
}) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const { quiz, minutes, course, class: classId } = await searchParams;
  const duration = Number(minutes);

  return (
    <main className="page">
      <LeaderboardView
        basePath="/leaderboard"
        quizId={quiz}
        courseId={course}
        classId={classId}
        minutes={Number.isFinite(duration) ? duration : undefined}
        currentUserId={profile.id}
      />
    </main>
  );
}
