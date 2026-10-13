import Link from "next/link";
import { KuisLetterMark, KuisLockup } from "@/components/kuis-mark";
import { getSessionProfile } from "@/lib/session";

export default async function Home() {
  const profile = await getSessionProfile();

  return (
    <main className="hero">
      <KuisLetterMark />
      <KuisLockup tone="onDark" markSize={84} />
      <h1>Practice quizzes and course materials</h1>
      <p className="lede">Course quizzes and timed runs, with a score you can check afterward.</p>
      <div>
        {profile ? (
          <Link className="btn btn-quiz" href="/quizzes">
            Start quiz
          </Link>
        ) : (
          <Link className="btn btn-quiz" href="/signup">
            Sign up
          </Link>
        )}
      </div>
      {profile ? (
        <p className="muted">
          Signed in as {profile.displayName} ({profile.role}).
        </p>
      ) : null}
    </main>
  );
}
