import { revalidateTag, unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { QUIZ_CATALOG_TAG } from "@/lib/quiz-catalog";
import type {
  BoardClass,
  BoardCourseGroup,
  BoardLeaderboardResult,
  BoardQuiz,
  LeaderboardBoardMeta,
} from "@/lib/leaderboard-board-shared";

export type {
  BoardClass,
  BoardCourseGroup,
  BoardLeaderboardEntry,
  BoardLeaderboardResult,
  BoardQuiz,
  LeaderboardBoardMeta,
} from "@/lib/leaderboard-board-shared";

export const LEADERBOARD_BOARD_TAG = "leaderboard-board";
export const LEADERBOARD_SCORES_TAG = "leaderboard-scores";

type CourseEmbed = { id: string; name: string } | { id: string; name: string }[] | null;

function courseOf(course: CourseEmbed, courseId: string | null): { key: string; name: string } {
  const row = !course ? null : Array.isArray(course) ? course[0] : course;
  if (!row || !courseId) return { key: "none", name: "No course" };
  return { key: row.id, name: row.name };
}

async function loadLeaderboardBoardMeta(): Promise<LeaderboardBoardMeta> {
  const supabase = createAdminClient();
  const [{ data: quizData, error: quizError }, { data: classData, error: classError }] =
    await Promise.all([
      supabase
        .from("quizzes")
        .select("id, title, course_id, courses(id, name)")
        .eq("status", "published")
        .order("title", { ascending: true }),
      supabase.from("classes").select("id, name").order("name", { ascending: true }),
    ]);

  if (quizError) {
    throw new Error(`Could not load leaderboard quizzes: ${quizError.message}`);
  }
  if (classError) {
    throw new Error(`Could not load classes: ${classError.message}`);
  }

  const quizzes: BoardQuiz[] = ((quizData ?? []) as {
    id: string;
    title: string;
    course_id: string | null;
    courses: CourseEmbed;
  }[]).map((quiz) => {
    const course = courseOf(quiz.courses, quiz.course_id);
    return {
      id: quiz.id,
      title: quiz.title,
      courseKey: course.key,
      courseName: course.name,
    };
  });

  const groups = new Map<string, BoardCourseGroup>();
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

  const classes = (classData ?? []) as BoardClass[];
  return { quizzes, courseGroups, classes };
}

async function loadQuizBoardEntries(
  quizId: string,
  classId: string | null,
): Promise<BoardLeaderboardResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("quiz_leaderboard", {
    p_quiz_id: quizId,
    ...(classId ? { p_class_id: classId } : {}),
  });

  if (error) {
    return {
      entries: [],
      error: "Could not load this leaderboard. Run the latest database migration, then try again.",
    };
  }

  return {
    entries: ((data ?? []) as {
      rank: number;
      student_id: string;
      display_name: string;
      score: number;
      submitted_at: string;
    }[]).map((row) => ({
      rank: Number(row.rank),
      studentId: row.student_id,
      displayName: row.display_name,
      value: `${row.score}%`,
      submittedAt: row.submitted_at,
    })),
  };
}

async function loadUnlimitedBoardEntries(
  minutes: number,
  classId: string | null,
): Promise<BoardLeaderboardResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("unlimited_leaderboard", {
    p_duration: minutes,
    ...(classId ? { p_class_id: classId } : {}),
  });

  if (error) {
    return {
      entries: [],
      error: "Could not load this leaderboard. Run the latest database migration, then try again.",
    };
  }

  return {
    entries: ((data ?? []) as {
      rank: number;
      student_id: string;
      display_name: string;
      correct_count: number;
      submitted_at: string;
    }[]).map((row) => ({
      rank: Number(row.rank),
      studentId: row.student_id,
      displayName: row.display_name,
      value: String(row.correct_count),
      submittedAt: row.submitted_at,
    })),
  };
}

export const getLeaderboardBoardMeta = unstable_cache(
  loadLeaderboardBoardMeta,
  ["leaderboard-board-meta"],
  {
    tags: [LEADERBOARD_BOARD_TAG, QUIZ_CATALOG_TAG],
    revalidate: 300,
  },
);

export function getQuizBoardEntries(quizId: string, classId?: string) {
  const classKey = classId ?? "all";
  return unstable_cache(
    () => loadQuizBoardEntries(quizId, classId ?? null),
    ["quiz-board-entries", quizId, classKey],
    {
      tags: [LEADERBOARD_SCORES_TAG],
      revalidate: 60,
    },
  )();
}

export function getUnlimitedBoardEntries(minutes: number, classId?: string) {
  const classKey = classId ?? "all";
  return unstable_cache(
    () => loadUnlimitedBoardEntries(minutes, classId ?? null),
    ["unlimited-board-entries", String(minutes), classKey],
    {
      tags: [LEADERBOARD_SCORES_TAG],
      revalidate: 60,
    },
  )();
}

export function revalidateLeaderboardBoard() {
  revalidateTag(LEADERBOARD_BOARD_TAG, { expire: 0 });
}

export function revalidateLeaderboardScores() {
  revalidateTag(LEADERBOARD_SCORES_TAG, { expire: 0 });
}
