import { Check, X } from "lucide-react";

export type RecapAnswer = {
  id: string;
  position: number;
  prompt: string;
  isCorrect: boolean;
  selectedLabels: string[];
};

type SnapshotOption = {
  id: string;
  label: string;
};

export function toRecapAnswer(answer: {
  id: string;
  position: number;
  prompt_snapshot: string;
  options_snapshot: unknown;
  selected_option_ids: string[] | null;
  is_correct: boolean;
}): RecapAnswer {
  const options = (answer.options_snapshot ?? []) as SnapshotOption[];
  const selected = new Set(answer.selected_option_ids ?? []);
  return {
    id: answer.id,
    position: answer.position,
    prompt: answer.prompt_snapshot,
    isCorrect: answer.is_correct,
    selectedLabels: options.filter((option) => selected.has(option.id)).map((option) => option.label),
  };
}

function AnswerGroup({
  title,
  answers,
  correct,
}: {
  title: string;
  answers: RecapAnswer[];
  correct: boolean;
}) {
  return (
    <section className="mt-8">
      <h2>
        {title} ({answers.length})
      </h2>
      {answers.length === 0 ? (
        <p className="muted mt-4">None.</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {answers.map((answer) => (
            <article className="resource-card" key={answer.id}>
              <p className={correct ? "badge badge-success" : "badge badge-error"}>
                {correct ? (
                  <Check aria-hidden="true" size={14} />
                ) : (
                  <X aria-hidden="true" size={14} />
                )}
                {correct ? "Correct" : "Incorrect"}
              </p>
              <h3>
                {answer.position}. {answer.prompt}
              </h3>
              <p>
                Your answer:{" "}
                {answer.selectedLabels.length > 0 ? answer.selectedLabels.join(", ") : "No answer"}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function ResultRecap({ answers }: { answers: RecapAnswer[] }) {
  const correct = answers.filter((answer) => answer.isCorrect);
  const incorrect = answers.filter((answer) => !answer.isCorrect);

  return (
    <>
      <AnswerGroup title="Correct" answers={correct} correct />
      <AnswerGroup title="Incorrect" answers={incorrect} correct={false} />
    </>
  );
}
