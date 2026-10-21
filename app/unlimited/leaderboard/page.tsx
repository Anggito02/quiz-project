import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { BoardPageLoading } from "@/components/loading-frame";
import { LeaderboardTable, type LeaderboardEntry } from "@/components/leaderboard-table";
import { SearchParamsPending } from "@/components/search-params-pending";
import { getSessionProfile } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

type BoardRow = {
  rank: number;
  student_id: string;
  display_name: string;
  correct_count: number;
  submitted_at: string;
};

async function UnlimitedLeaderboardBoard({
  minutes,
  currentUserId,
}: {
  minutes?: string;
  currentUserId: string;
}) {
  const duration = minutes === "10" || minutes === "20" ? Number(minutes) : 5;
  const supabase = await createClient();
  const { data } = await supabase.rpc("unlimited_leaderboard", { p_duration: duration });
  const entries: LeaderboardEntry[] = ((data ?? []) as BoardRow[]).map((row) => ({
    rank: Number(row.rank),
    studentId: row.student_id,
    displayName: row.display_name,
    value: String(row.correct_count),
    submittedAt: row.submitted_at,
  }));

  return (
    <main className="page">
      <section className="board-panel">
        <p>
          <Link href="/unlimited">Unlimited</Link>
        </p>
        <h1 className="mt-4">{duration} minute board</h1>
        <p className="tab-row">
          {[5, 10, 20].map((value) => (
            <Link
              className={duration === value ? "tab is-active" : "tab"}
              href={`/unlimited/leaderboard?minutes=${value}`}
              key={value}
            >
              {value} minutes
            </Link>
          ))}
        </p>
        <LeaderboardTable
          entries={entries}
          currentUserId={currentUserId}
          valueHeading="Correct"
          summary="Ranked by correct answers. The top 100 are shown. A run only appears on the board for its own time limit."
        />
      </section>
    </main>
  );
}

export default async function UnlimitedLeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ minutes?: string }>;
}) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const { minutes } = await searchParams;

  return (
    <Suspense key={minutes ?? "5"} fallback={<BoardPageLoading />}>
      <SearchParamsPending fallback={<BoardPageLoading />}>
        <UnlimitedLeaderboardBoard minutes={minutes} currentUserId={profile.id} />
      </SearchParamsPending>
    </Suspense>
  );
}
