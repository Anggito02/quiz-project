import Link from "next/link";
import { BookOpen, Pencil } from "lucide-react";
import { ResetBoardForms } from "@/app/admin/leaderboard/reset-forms";
import { createClient } from "@/lib/supabase/server";
import { LeaderboardTable, type LeaderboardEntry } from "./leaderboard-table";
import { QuizBoardPicker } from "./quiz-board-picker";

type QuizRow = {
  rank: number;
  student_id: string;
  display_name: string;
  score: number;
  submitted_at: string;
};

type UnlimitedRow = {
  rank: number;
  student_id: string;
  display_name: string;
  correct_count: number;
  submitted_at: string;
};

type CourseEmbed = { id: string; name: string } | { id: string; name: string }[] | null;

const PICKER_LIMIT = 500;

type PickerQuizRow = {
  id: string;
  title: string;
  course_id: string | null;
  courses: CourseEmbed;
};

type QuizOption = {
  id: string;
  title: string;
  courseKey: string;
  courseName: string;
};

type CourseGroup = {
  id: string;
  name: string;
  quizzes: QuizOption[];
};

function quizEntries(rows: QuizRow[]): LeaderboardEntry[] {
  return rows.map((row) => ({
    rank: Number(row.rank),
    studentId: row.student_id,
    displayName: row.display_name,
    value: `${row.score}%`,
    submittedAt: row.submitted_at,
  }));
}

function unlimitedEntries(rows: UnlimitedRow[]): LeaderboardEntry[] {
  return rows.map((row) => ({
    rank: Number(row.rank),
    studentId: row.student_id,
    displayName: row.display_name,
    value: String(row.correct_count),
    submittedAt: row.submitted_at,
  }));
}

function courseOf(course: CourseEmbed, courseId: string | null): { key: string; name: string } {
  const row = !course ? null : Array.isArray(course) ? course[0] : course;
  if (!row || !courseId) return { key: "none", name: "No course" };
  return { key: row.id, name: row.name };
}

function boardHref(
  basePath: string,
  options: { course?: string; quiz?: string; minutes?: number; classId?: string },
) {
  const params = new URLSearchParams();
  if (options.classId) params.set("class", options.classId);
  if (options.minutes) {
    params.set("minutes", String(options.minutes));
  } else {
    if (options.course) params.set("course", options.course);
    if (options.quiz) params.set("quiz", options.quiz);
  }
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export async function LeaderboardView({
  basePath,
  quizId,
  courseId,
  classId,
  minutes,
  currentUserId,
  showReset = false,
  notice,
  intro = "Published quiz boards and Unlimited time boards.",
}: {
  basePath: string;
  quizId?: string;
  courseId?: string;
  classId?: string;
  minutes?: number;
  currentUserId: string;
  showReset?: boolean;
  notice?: string;
  intro?: string;
}) {
  const supabase = await createClient();
  const quizColumns = "id, title, course_id, courses(id, name)";
  const [{ data: quizData }, { data: classData }] = await Promise.all([
    supabase
      .from("quizzes")
      .select(quizColumns)
      .eq("status", "published")
      .order("title", { ascending: true })
      .limit(PICKER_LIMIT),
    supabase.from("classes").select("id, name").order("name", { ascending: true }),
  ]);

  const quizRows = (quizData ?? []) as PickerQuizRow[];
  if (quizId && quizRows.length === PICKER_LIMIT && !quizRows.some((quiz) => quiz.id === quizId)) {
    const { data: linked } = await supabase
      .from("quizzes")
      .select(quizColumns)
      .eq("status", "published")
      .eq("id", quizId)
      .maybeSingle();
    if (linked) quizRows.push(linked as PickerQuizRow);
  }

  const quizzes = quizRows.map((quiz) => {
    const course = courseOf(quiz.courses, quiz.course_id);
    return {
      id: quiz.id,
      title: quiz.title,
      courseKey: course.key,
      courseName: course.name,
    } satisfies QuizOption;
  });

  const groups = new Map<string, CourseGroup>();
  for (const quiz of quizzes) {
    const group = groups.get(quiz.courseKey) ?? {
      id: quiz.courseKey,
      name: quiz.courseName,
      quizzes: [],
    };
    group.quizzes.push(quiz);
    groups.set(quiz.courseKey, group);
  }
  const courseGroups = [...groups.values()].sort((left, right) => {
    if (left.id === "none") return 1;
    if (right.id === "none") return -1;
    return left.name.localeCompare(right.name);
  });

  const classes = (classData ?? []) as { id: string; name: string }[];
  const activeClass = classes.find((item) => item.id === classId);

  const requestedMinutes = minutes === 5 || minutes === 10 || minutes === 20 ? minutes : undefined;
  const requestedQuiz = quizzes.find((quiz) => quiz.id === quizId);
  const useQuiz = Boolean(requestedQuiz) || (!requestedMinutes && quizzes.length > 0);
  const fallbackGroup =
    courseGroups.find((group) => group.id === courseId) ?? courseGroups[0];
  const activeQuiz = useQuiz
    ? (requestedQuiz ?? fallbackGroup?.quizzes[0])
    : undefined;
  const activeGroup = activeQuiz
    ? courseGroups.find((group) => group.quizzes.some((quiz) => quiz.id === activeQuiz.id))
    : fallbackGroup;
  const activeMinutes = activeQuiz ? undefined : (requestedMinutes ?? (quizzes.length === 0 ? 5 : undefined));

  let entries: LeaderboardEntry[] = [];
  let valueHeading = "Score";
  let loadError: string | undefined;
  const classFilter = activeClass ? { p_class_id: activeClass.id } : {};
  if (activeQuiz) {
    const { data, error } = await supabase.rpc("quiz_leaderboard", {
      p_quiz_id: activeQuiz.id,
      ...classFilter,
    });
    if (error) loadError = "Could not load this leaderboard. Run the latest database migration, then try again.";
    entries = quizEntries((data ?? []) as QuizRow[]);
  } else if (activeMinutes) {
    valueHeading = "Correct";
    const { data, error } = await supabase.rpc("unlimited_leaderboard", {
      p_duration: activeMinutes,
      ...classFilter,
    });
    if (error) loadError = "Could not load this leaderboard. Run the latest database migration, then try again.";
    entries = unlimitedEntries((data ?? []) as UnlimitedRow[]);
  }

  const summary = activeClass
    ? activeQuiz
      ? `Best score for students in ${activeClass.name}. The top 100 in this class are shown.`
      : `Ranked by correct answers for students in ${activeClass.name}. The top 100 in this class are shown. A run only appears on the board for its own time limit.`
    : activeQuiz
      ? "Best score for each student. The top 100 are shown."
      : "Ranked by correct answers. The top 100 are shown. A run only appears on the board for its own time limit.";

  const boardTitle = activeQuiz
    ? activeQuiz.title
    : activeMinutes
      ? `${activeMinutes} minute board`
      : "Leaderboard";

  return (
    <div className="board-stack">
      <section className="board-panel">
        <h1>Leaderboard</h1>
        <p className="lede mt-2">{intro}</p>
        {notice ? <p className="notice notice-success mt-4">{notice}</p> : null}
        {courseGroups.length > 0 ? (
          <nav className="tab-row" aria-label="Courses">
            {courseGroups.map((group) => (
              <Link
                className={activeQuiz && activeGroup?.id === group.id ? "tab is-active" : "tab"}
                href={boardHref(basePath, {
                  course: group.id,
                  quiz: group.quizzes[0]?.id,
                  classId: activeClass?.id,
                })}
                key={group.id}
              >
                <BookOpen aria-hidden="true" size={14} />
                {group.name}
              </Link>
            ))}
          </nav>
        ) : null}
        <nav className="tab-row" aria-label="Classes">
          <Link
            className={activeClass ? "class-chip" : "class-chip is-active"}
            href={boardHref(basePath, {
              course: activeQuiz ? activeGroup?.id : undefined,
              quiz: activeQuiz?.id,
              minutes: activeQuiz ? undefined : activeMinutes,
            })}
          >
            All classes
          </Link>
          {classes.map((item) => (
            <Link
              className={activeClass?.id === item.id ? "class-chip is-active" : "class-chip"}
              href={boardHref(basePath, {
                course: activeQuiz ? activeGroup?.id : undefined,
                quiz: activeQuiz?.id,
                minutes: activeQuiz ? undefined : activeMinutes,
                classId: item.id,
              })}
              key={item.id}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <QuizBoardPicker
          key={activeQuiz?.id ?? `minutes-${activeMinutes ?? "none"}`}
          basePath={basePath}
          quizzes={quizzes}
          quizId={activeQuiz?.id}
          classId={activeClass?.id}
        />
        <nav className="tab-row" aria-label="Unlimited boards">
          {[5, 10, 20].map((value) => (
            <Link
              className={!activeQuiz && activeMinutes === value ? "tab is-active" : "tab"}
              href={boardHref(basePath, { minutes: value, classId: activeClass?.id })}
              key={value}
            >
              {value} minutes
            </Link>
          ))}
        </nav>
      </section>
      <section className="board-panel">
        <div className="board-title-row">
          <h2>{boardTitle}</h2>
          {activeQuiz ? (
            <Link href={`/quizzes/${activeQuiz.id}`} aria-label={`Open ${activeQuiz.title}`}>
              <Pencil aria-hidden="true" size={18} />
            </Link>
          ) : null}
        </div>
        {loadError ? <p className="error-text mt-4">{loadError}</p> : null}
        <h3 className="mt-6">Leaderboard</h3>
        <LeaderboardTable
          entries={entries}
          currentUserId={currentUserId}
          valueHeading={valueHeading}
          summary={summary}
          showHeading={false}
        />
        {showReset && (activeQuiz || activeMinutes) ? (
          <ResetBoardForms quizId={activeQuiz?.id} minutes={activeMinutes} />
        ) : null}
      </section>
    </div>
  );
}
