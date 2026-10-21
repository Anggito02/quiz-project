export type CatalogCourse = { id: string; name: string };

export type CatalogQuiz = {
  id: string;
  title: string;
  description: string | null;
  courseId: string | null;
  courseName: string;
  createdAt: string;
};

export type PublishedCatalog = {
  courses: CatalogCourse[];
  quizzes: CatalogQuiz[];
  uncategorized: number;
};

export type TrendingQuiz = {
  id: string;
  title: string;
  description: string | null;
  courseName: string;
  attemptCount: number;
};

export function filterCatalogQuizzes(
  quizzes: CatalogQuiz[],
  options: { courseKey?: string; q?: string },
) {
  const term = (options.q ?? "").trim().toLowerCase();
  return quizzes.filter((quiz) => {
    if (options.courseKey === "none" && quiz.courseId) return false;
    if (options.courseKey && options.courseKey !== "none" && quiz.courseId !== options.courseKey) {
      return false;
    }
    if (!term) return true;
    const haystack = `${quiz.title} ${quiz.description ?? ""}`.toLowerCase();
    return haystack.includes(term);
  });
}
