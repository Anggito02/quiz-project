"use client";

import { useRouter } from "next/navigation";

export function QuizBoardSelect({
  basePath,
  quizzes,
  quizId,
  course,
  classId,
}: {
  basePath: string;
  quizzes: { id: string; title: string }[];
  quizId: string;
  course?: string;
  classId?: string;
}) {
  const router = useRouter();

  return (
    <label className="field mt-6 max-w-md">
      <span className="label">Quiz</span>
      <select
        className="input"
        value={quizId}
        onChange={(event) => {
          const next = new URLSearchParams();
          if (classId) next.set("class", classId);
          if (course) next.set("course", course);
          next.set("quiz", event.target.value);
          router.push(`${basePath}?${next.toString()}`);
        }}
      >
        {quizzes.map((quiz) => (
          <option key={quiz.id} value={quiz.id}>
            {quiz.title}
          </option>
        ))}
      </select>
    </label>
  );
}
