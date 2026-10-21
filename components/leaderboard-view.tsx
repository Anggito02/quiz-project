import { Suspense } from "react";
import Link from "next/link";
import { BookOpen, Pencil } from "lucide-react";
import { ResetBoardForms } from "@/app/admin/leaderboard/reset-forms";
import { LeaderboardResultsLoading } from "@/components/loading-frame";
import { SearchParamsPending } from "@/components/search-params-pending";
import {
  getLeaderboardBoardMeta,
  getQuizBoardEntries,
  getUnlimitedBoardEntries,
  type BoardClass,
  type BoardCourseGroup,
  type BoardQuiz,
} from "@/lib/leaderboard-board";
import { LeaderboardTable } from "./leaderboard-table";
import { QuizBoardPicker } from "./quiz-board-picker";

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

function resultsKey(options: {
  quizId?: string;
  minutes?: number;
  classId?: string;
}) {
  return [options.quizId ?? "", options.minutes ?? "", options.classId ?? ""].join("|");
}

function resolveBoard(options: {
  quizzes: BoardQuiz[];
  courseGroups: BoardCourseGroup[];
  classes: BoardClass[];
  quizId?: string;
  courseId?: string;
  classId?: string;
  minutes?: number;
}) {
  const activeClass = options.classes.find((item) => item.id === options.classId);
  const requestedMinutes =
    options.minutes === 5 || options.minutes === 10 || options.minutes === 20
      ? options.minutes
      : undefined;
  const requestedQuiz = options.quizzes.find((quiz) => quiz.id === options.quizId);
  const useQuiz = Boolean(requestedQuiz) || (!requestedMinutes && options.quizzes.length > 0);
  const fallbackGroup =
    options.courseGroups.find((group) => group.id === options.courseId) ?? options.courseGroups[0];
  const activeQuiz = useQuiz ? (requestedQuiz ?? fallbackGroup?.quizzes[0]) : undefined;
  const activeGroup = activeQuiz
    ? options.courseGroups.find((group) => group.quizzes.some((quiz) => quiz.id === activeQuiz.id))
    : fallbackGroup;
  const activeMinutes = activeQuiz
    ? undefined
    : (requestedMinutes ?? (options.quizzes.length === 0 ? 5 : undefined));

  return { activeClass, activeQuiz, activeGroup, activeMinutes };
}

async function LeaderboardResults({
  activeQuiz,
  activeMinutes,
  activeClass,
  currentUserId,
  showReset,
}: {
  activeQuiz?: BoardQuiz;
  activeMinutes?: number;
  activeClass?: BoardClass;
  currentUserId: string;
  showReset: boolean;
}) {
  let valueHeading = "Score";
  let loadError: string | undefined;
  let entries: Awaited<ReturnType<typeof getQuizBoardEntries>>["entries"] = [];

  if (activeQuiz) {
    const result = await getQuizBoardEntries(activeQuiz.id, activeClass?.id);
    entries = result.entries;
    loadError = result.error;
  } else if (activeMinutes) {
    valueHeading = "Correct";
    const result = await getUnlimitedBoardEntries(activeMinutes, activeClass?.id);
    entries = result.entries;
    loadError = result.error;
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
  );
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
  const { quizzes, courseGroups, classes } = await getLeaderboardBoardMeta();
  const { activeClass, activeQuiz, activeGroup, activeMinutes } = resolveBoard({
    quizzes,
    courseGroups,
    classes,
    quizId,
    courseId,
    classId,
    minutes,
  });

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
      <Suspense
        key={resultsKey({
          quizId: activeQuiz?.id,
          minutes: activeMinutes,
          classId: activeClass?.id,
        })}
        fallback={<LeaderboardResultsLoading />}
      >
        <SearchParamsPending fallback={<LeaderboardResultsLoading />}>
          <LeaderboardResults
            activeQuiz={activeQuiz}
            activeMinutes={activeMinutes}
            activeClass={activeClass}
            currentUserId={currentUserId}
            showReset={showReset}
          />
        </SearchParamsPending>
      </Suspense>
    </div>
  );
}
