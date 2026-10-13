import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export default async function QuizzesPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase
    .from("quizzes")
    .select("id, title, description, courses(name)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const quizzes = (data ?? []) as {
    id: string;
    title: string;
    description: string | null;
    courses: { name: string } | { name: string }[] | null;
  }[];

  const groups = new Map<string, typeof quizzes>();
  for (const quiz of quizzes) {
    const course = quiz.courses;
    const name = !course
      ? "No course"
      : Array.isArray(course)
        ? course[0]?.name ?? "No course"
        : course.name;
    const list = groups.get(name) ?? [];
    list.push(quiz);
    groups.set(name, list);
  }
  const grouped = [...groups.entries()].sort(([left], [right]) => {
    if (left === "No course") return 1;
    if (right === "No course") return -1;
    return left.localeCompare(right);
  });

  return (
    <main className="page">
      <h1>Quizzes</h1>
      <p className="mt-4 max-w-[72ch]">Published practice quizzes, grouped by course.</p>
      {quizzes.length === 0 ? (
        <p className="mt-8">No published quizzes yet.</p>
      ) : (
        grouped.map(([name, items]) => (
          <section className="course-group" key={name}>
            <h2 className="course-label">{name}</h2>
            <ul className="card-grid">
              {items.map((quiz) => (
                <li className="resource-card" key={quiz.id}>
                  <p className="tag">Quiz</p>
                  <h3>
                    <Link href={`/quizzes/${quiz.id}`}>{quiz.title}</Link>
                  </h3>
                  {quiz.description ? <p className="lede">{quiz.description}</p> : null}
                  <p className="mt-2 flex flex-wrap gap-3">
                    <Link className="btn btn-quiz btn-sm" href={`/quizzes/${quiz.id}`}>
                      Start quiz
                    </Link>
                    <Link className="btn btn-ghost btn-sm" href={`/leaderboard?quiz=${quiz.id}`}>
                      Leaderboard
                    </Link>
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  );
}
