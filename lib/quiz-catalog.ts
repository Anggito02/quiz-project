import { revalidateTag, unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CatalogCourse, CatalogQuiz, PublishedCatalog, TrendingQuiz } from "@/lib/quiz-catalog-shared";

export type { CatalogCourse, CatalogQuiz, PublishedCatalog, TrendingQuiz } from "@/lib/quiz-catalog-shared";
export { filterCatalogQuizzes } from "@/lib/quiz-catalog-shared";

export const QUIZ_CATALOG_TAG = "quiz-catalog";
export const QUIZ_TRENDING_TAG = "quiz-trending";

type CourseEmbed = { id: string; name: string } | { id: string; name: string }[] | null;

function courseOf(course: CourseEmbed, courseId: string | null): CatalogCourse {
  const row = !course ? null : Array.isArray(course) ? course[0] : course;
  if (!row || !courseId) return { id: "none", name: "No course" };
  return { id: row.id, name: row.name };
}

async function loadPublishedCatalog(): Promise<PublishedCatalog> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select("id, title, description, course_id, created_at, courses(id, name)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Could not load published quizzes: ${error.message}`);
  }

  const quizzes: CatalogQuiz[] = ((data ?? []) as {
    id: string;
    title: string;
    description: string | null;
    course_id: string | null;
    created_at: string;
    courses: CourseEmbed;
  }[]).map((quiz) => {
    const course = courseOf(quiz.courses, quiz.course_id);
    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      courseId: quiz.course_id,
      courseName: course.name,
      createdAt: quiz.created_at,
    };
  });

  const courseMap = new Map<string, CatalogCourse>();
  let uncategorized = 0;
  for (const quiz of quizzes) {
    if (!quiz.courseId) {
      uncategorized += 1;
      continue;
    }
    if (!courseMap.has(quiz.courseId)) {
      courseMap.set(quiz.courseId, { id: quiz.courseId, name: quiz.courseName });
    }
  }

  const courses = [...courseMap.values()].sort((left, right) =>
    left.name.localeCompare(right.name),
  );

  return { courses, quizzes, uncategorized };
}

async function loadTrendingQuizzes(): Promise<TrendingQuiz[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("trending_quizzes", { p_limit: 4 });
  if (error) return [];

  return ((data ?? []) as {
    id: string;
    title: string;
    description: string | null;
    course_name: string | null;
    attempt_count: number;
  }[]).map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    courseName: quiz.course_name ?? "No course",
    attemptCount: Number(quiz.attempt_count),
  }));
}

export const getPublishedCatalog = unstable_cache(loadPublishedCatalog, ["published-quiz-catalog"], {
  tags: [QUIZ_CATALOG_TAG],
  revalidate: 300,
});

export const getTrendingQuizzes = unstable_cache(loadTrendingQuizzes, ["trending-quizzes"], {
  tags: [QUIZ_TRENDING_TAG],
  revalidate: 60,
});

export function revalidateQuizCatalog() {
  revalidateTag(QUIZ_CATALOG_TAG, { expire: 0 });
  revalidateTag(QUIZ_TRENDING_TAG, { expire: 0 });
}
