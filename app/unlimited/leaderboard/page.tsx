import Link from "next/link";
import { redirect } from "next/navigation";
import { LeaderboardTable, type LeaderboardEntry } from "@/components/leaderboard-table";
import { getSessionProfile } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

type BoardRow = {
  rank: number;
  student_id: string;
  display_name: string;
  correct_count: number;
  submitted_at: string;
};

export default async function UnlimitedLeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ minutes?: string }>;
}) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const { minutes } = await searchParams;
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
        currentUserId={profile.id}
        valueHeading="Correct"
        summary="Ranked by correct answers. The top 100 are shown. A run only appears on the board for its own time limit."
      />
    </main>
  );
}
