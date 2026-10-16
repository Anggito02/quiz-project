import { PendingLink } from "@/components/pending-link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { UnlimitedSetupForm } from "./setup-form";

function formatWhen(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

export default async function UnlimitedPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const [{ data: courseData }, { data: sessionData }] = await Promise.all([
    supabase.from("courses").select("id, name").order("name", { ascending: true }),
    supabase
      .from("unlimited_sessions")
      .select("id, duration_minutes, course_ids, correct_count, question_count, submitted_at")
      .eq("student_id", profile.id)
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false }),
  ]);

  const courses = (courseData ?? []) as { id: string; name: string }[];
  const courseName = new Map(courses.map((course) => [course.id, course.name]));
  const sessions = sessionData ?? [];

  return (
    <main className="page">
      <h1>Unlimited</h1>
      <p className="mt-4 max-w-[72ch]">
        Pick one or more courses and a time limit. Questions are shuffled from the published quizzes
        in those courses.
      </p>
      <p className="mt-4 flex flex-wrap gap-4">
        <PendingLink href="/leaderboard?minutes=5">5 minute board</PendingLink>
        <PendingLink href="/leaderboard?minutes=10">10 minute board</PendingLink>
        <PendingLink href="/leaderboard?minutes=20">20 minute board</PendingLink>
      </p>
      {profile.role === "student" ? (
        courses.length === 0 ? (
          <p className="mt-8">No courses yet.</p>
        ) : (
          <UnlimitedSetupForm courses={courses} />
        )
      ) : (
        <p className="mt-8">Only students can start a timed quiz.</p>
      )}

      <h2 className="mt-12">Your timed runs</h2>
      {sessions.length === 0 ? (
        <p className="mt-4">No timed runs yet.</p>
      ) : (
        <ul className="ruled-list mt-4">
          {sessions.map((session) => {
            const names = (session.course_ids ?? [])
              .map((id: string) => courseName.get(id) ?? "Course")
              .join(", ");
            return (
              <li key={session.id}>
                <PendingLink href={`/unlimited/${session.id}`}>
                  {formatWhen(session.submitted_at)} — {session.duration_minutes} min —{" "}
                  {session.correct_count} correct
                </PendingLink>
                <p className="muted mt-1">{names}</p>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
