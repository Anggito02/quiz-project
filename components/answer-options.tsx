const TONES = [
  "answer-blue",
  "answer-teal",
  "answer-gold",
  "answer-orange",
  "answer-purple",
  "answer-pink",
] as const;

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function AnswerOptions({
  questionId,
  type,
  options,
  selected,
  onChange,
}: {
  questionId: string;
  type: "single" | "multi";
  options: { id: string; label: string }[];
  selected: string[];
  onChange: (optionId: string) => void;
}) {
  return (
    <div className="answer-grid">
      {options.map((option, index) => {
        const isSelected = selected.includes(option.id);
        return (
          <label
            className={`answer-tile ${TONES[index % TONES.length]}${isSelected ? " is-selected" : ""}`}
            key={option.id}
          >
            <input
              type={type === "single" ? "radio" : "checkbox"}
              name={questionId}
              checked={isSelected}
              onChange={() => onChange(option.id)}
            />
            <span className="answer-mark">{LETTERS[index] ?? index + 1}</span>
            <span className="answer-copy">{option.label}</span>
            {isSelected ? <span className="answer-state">Selected</span> : null}
          </label>
        );
      })}
    </div>
  );
}
