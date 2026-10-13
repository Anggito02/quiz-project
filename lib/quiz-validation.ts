export type QuestionType = "single" | "multi";

export type OptionDraft = {
  label: string;
  isCorrect: boolean;
};

export function cleanOptions(options: OptionDraft[]): OptionDraft[] {
  return options
    .map((option) => ({
      label: option.label.trim(),
      isCorrect: Boolean(option.isCorrect),
    }))
    .filter((option) => option.label.length > 0);
}

export function validateQuestion(type: string, options: OptionDraft[]): string | null {
  if (type !== "single" && type !== "multi") {
    return "Choose single-answer or multi-select.";
  }

  const cleaned = cleanOptions(options);
  if (cleaned.length < 2) {
    return "Add at least two options.";
  }

  const correctCount = cleaned.filter((option) => option.isCorrect).length;
  if (type === "single" && correctCount !== 1) {
    return "A single-answer question needs exactly one correct option.";
  }
  if (type === "multi" && correctCount < 1) {
    return "A multi-select question needs at least one correct option.";
  }

  return null;
}
