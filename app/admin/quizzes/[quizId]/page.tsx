import Link from "next/link";
import { notFound } from "next/navigation";
import type { OptionDraft, QuestionType } from "@/lib/quiz-validation";
import { createClient } from "@/lib/supabase/server";
import { deleteQuestion, moveQuestion } from "./actions";
import { ImportQuestionsForm } from "./import-form";
import { QuestionForm } from "./question-form";
import { QuizSettingsForm } from "./quiz-settings-form";

type OptionRow = {
  id: string;
  label: string;
  is_correct: boolean;
  position: number;
};

type QuestionRow = {
  id: string;
  prompt: string;
  type: QuestionType;
  position: number;
  options: OptionRow[];
};

export default async function QuizEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { quizId } = await params;
  const { edit } = await searchParams;
  const supabase = await createClient();

  const [{ data: quiz }, { data: courseData }] = await Promise.all([
    supabase
      .from("quizzes")
      .select("id, title, description, status, course_id")
      .eq("id", quizId)
      .maybeSingle(),
    supabase.from("courses").select("id, name").order("name", { ascending: true }),
  ]);

  if (!quiz || (quiz.status !== "draft" && quiz.status !== "published" && quiz.status !== "archived")) {
    notFound();
  }

  const { data: questionData } = await supabase
    .from("questions")
    .select("id, prompt, type, position, options(id, label, is_correct, position)")
    .eq("quiz_id", quizId)
    .order("position", { ascending: true });

  const questions = ((questionData ?? []) as QuestionRow[]).map((question) => ({
    ...question,
    options: (Array.isArray(question.options) ? question.options : [])
      .slice()
      .sort((a, b) => a.position - b.position),
  }));

  return (
    <main className="page">
      <p>
        <Link href="/admin/quizzes">All quizzes</Link>
      </p>
      <h1 className="mt-4">Edit quiz</h1>
      <QuizSettingsForm
        key={`${quiz.title}-${quiz.status}-${quiz.description ?? ""}-${quiz.course_id ?? ""}`}
        quizId={quiz.id}
        title={quiz.title}
        description={quiz.description}
        status={quiz.status}
        courseId={quiz.course_id}
        courses={(courseData ?? []) as { id: string; name: string }[]}
      />

      <h2 className="mt-12">Questions</h2>
      {questions.length === 0 ? (
        <p className="mt-4">No questions yet.</p>
      ) : (
        <ol className="ruled-list mt-4">
          {questions.map((question, index) => {
            const drafts: OptionDraft[] = question.options.map((option) => ({
              label: option.label,
              isCorrect: option.is_correct,
            }));
            return (
              <li key={question.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="label">
                      {index + 1}. {question.type === "single" ? "Single-answer" : "Multi-select"}
                    </p>
                    <p className="mt-2 max-w-[72ch]">{question.prompt}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form action={moveQuestion}>
                      <input type="hidden" name="quizId" value={quiz.id} />
                      <input type="hidden" name="questionId" value={question.id} />
                      <input type="hidden" name="direction" value="up" />
                      <button className="btn btn-admin btn-sm" type="submit" disabled={index === 0}>
                        Up
                      </button>
                    </form>
                    <form action={moveQuestion}>
                      <input type="hidden" name="quizId" value={quiz.id} />
                      <input type="hidden" name="questionId" value={question.id} />
                      <input type="hidden" name="direction" value="down" />
                      <button
                        className="btn btn-admin btn-sm"
                        type="submit"
                        disabled={index === questions.length - 1}
                      >
                        Down
                      </button>
                    </form>
                    <Link className="btn btn-admin btn-sm" href={`/admin/quizzes/${quiz.id}?edit=${question.id}`}>
                      Edit
                    </Link>
                    <form action={deleteQuestion}>
                      <input type="hidden" name="quizId" value={quiz.id} />
                      <input type="hidden" name="questionId" value={question.id} />
                      <button className="btn btn-danger btn-sm" type="submit">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
                <ul className="mt-3 grid gap-1">
                  {question.options.map((option) => (
                    <li key={option.id}>
                      {option.is_correct ? "Correct: " : "Option: "}
                      {option.label}
                    </li>
                  ))}
                </ul>
                {edit === question.id ? (
                  <div className="mt-4">
                    <QuestionForm
                      quizId={quiz.id}
                      questionId={question.id}
                      initialPrompt={question.prompt}
                      initialType={question.type}
                      initialOptions={drafts}
                      submitLabel="Save question"
                    />
                    <p className="mt-3">
                      <Link href={`/admin/quizzes/${quiz.id}`}>Cancel</Link>
                    </p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}

      <h2 className="mt-12">Import from Excel</h2>
      <p className="mt-4 max-w-[72ch]">
        Download the template, fill in questions, then upload it. The file is not stored. Valid rows
        are added after the questions already on this quiz.
      </p>
      <ImportQuestionsForm quizId={quiz.id} />

      <h2 className="mt-12">Add a question</h2>
      <div className="mt-4 max-w-3xl">
        <QuestionForm quizId={quiz.id} submitLabel="Add question" />
      </div>
    </main>
  );
}
