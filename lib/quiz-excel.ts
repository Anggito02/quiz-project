import type ExcelJS from "exceljs";
import { cleanOptions, validateQuestion, type OptionDraft, type QuestionType } from "@/lib/quiz-validation";

async function loadExcel() {
  return (await import("exceljs")).default;
}

export const MAX_IMPORT_QUESTIONS = 200;
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

const HEADERS = [
  "prompt",
  "type",
  "option_a",
  "option_b",
  "option_c",
  "option_d",
  "option_e",
  "option_f",
  "correct",
] as const;

const OPTION_LETTERS = ["a", "b", "c", "d", "e", "f"] as const;

export type ImportedQuestion = {
  prompt: string;
  type: QuestionType;
  options: OptionDraft[];
};

function cellText(cell: ExcelJS.Cell) {
  return String(cell.text ?? "").replace(/\s+/g, " ").trim();
}

export async function buildQuizTemplate() {
  const Excel = await loadExcel();
  const workbook = new Excel.Workbook();
  const questions = workbook.addWorksheet("Questions");
  questions.addRow([...HEADERS]);
  questions.getRow(1).font = { bold: true };
  questions.columns = [
    { width: 48 },
    { width: 12 },
    { width: 24 },
    { width: 24 },
    { width: 24 },
    { width: 24 },
    { width: 24 },
    { width: 24 },
    { width: 16 },
  ];
  questions.views = [{ state: "frozen", ySplit: 1 }];
  const withValidation = questions as ExcelJS.Worksheet & {
    dataValidations: {
      add: (
        range: string,
        validation: {
          type: "list";
          allowBlank: boolean;
          formulae: string[];
          showErrorMessage: boolean;
          errorTitle: string;
          error: string;
        },
      ) => void;
    };
  };
  withValidation.dataValidations.add("B2:B500", {
    type: "list",
    allowBlank: true,
    formulae: ['"single,multi"'],
    showErrorMessage: true,
    errorTitle: "Type",
    error: "Use single or multi.",
  });

  const instructions = workbook.addWorksheet("Instructions");
  instructions.getColumn(1).width = 88;
  const lines = [
    "Fill in the Questions sheet. Leave the header row unchanged.",
    "",
    "prompt: the question text.",
    "type: single or multi.",
    "option_a through option_f: write at least two options. Leave unused columns blank.",
    "correct: the letter of each right option. One letter for single (B). Several for multi (A, C).",
    "",
    "Example",
    "prompt: What is 2 + 2?",
    "type: single",
    "option_a: 3",
    "option_b: 4",
    "option_c: 5",
    "option_d: 6",
    "correct: B",
    "",
    "Example",
    "prompt: Which of these are even?",
    "type: multi",
    "option_a: 1",
    "option_b: 2",
    "option_c: 3",
    "option_d: 4",
    "correct: B, D",
    "",
    "Blank rows are ignored. Do not upload this file until the Questions sheet has your own questions.",
  ];
  lines.forEach((line, index) => {
    const row = instructions.getRow(index + 1);
    row.getCell(1).value = line;
    row.getCell(1).alignment = { wrapText: true };
  });

  const output = await workbook.xlsx.writeBuffer();
  return Buffer.from(output);
}

export async function parseQuizWorkbook(
  bytes: Buffer,
): Promise<{ questions: ImportedQuestion[] } | { error: string }> {
  const Excel = await loadExcel();
  const workbook = new Excel.Workbook();
  try {
    await workbook.xlsx.load(bytes as unknown as Parameters<ExcelJS.Xlsx["load"]>[0]);
  } catch {
    return { error: "That file could not be read. Upload an .xlsx workbook." };
  }

  const sheet = workbook.getWorksheet("Questions");
  if (!sheet) return { error: "The workbook needs a sheet named Questions." };

  const header = sheet.getRow(1);
  const columnByHeader = new Map<string, number>();
  header.eachCell({ includeEmpty: true }, (cell, column) => {
    const name = cellText(cell).toLowerCase();
    if (name && !columnByHeader.has(name)) columnByHeader.set(name, column);
  });

  const missing = HEADERS.filter((name) => !columnByHeader.has(name));
  if (missing.length > 0) {
    return { error: `The Questions sheet is missing a header: ${missing.join(", ")}.` };
  }

  const questions: ImportedQuestion[] = [];
  const errors: string[] = [];
  let filledRows = 0;

  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    const values = Object.fromEntries(
      HEADERS.map((name) => [name, cellText(row.getCell(columnByHeader.get(name) ?? 1))]),
    ) as Record<(typeof HEADERS)[number], string>;

    if (HEADERS.every((name) => !values[name])) continue;
    filledRows += 1;
    if (filledRows > MAX_IMPORT_QUESTIONS) {
      return { error: `A file can add at most ${MAX_IMPORT_QUESTIONS} questions.` };
    }

    const type = values.type.toLowerCase();
    const marks = [
      ...new Set(
        values.correct
          .toLowerCase()
          .split(/[,;]/)
          .map((part) => part.trim())
          .filter(Boolean),
      ),
    ];
    const unknown = marks.filter(
      (mark) => !OPTION_LETTERS.includes(mark as (typeof OPTION_LETTERS)[number]),
    );
    if (unknown.length > 0) {
      errors.push(`Row ${rowNumber}: correct must use letters A through F.`);
      continue;
    }

    const raw = OPTION_LETTERS.map((letter) => ({
      label: values[`option_${letter}`],
      isCorrect: marks.includes(letter),
    }));
    if (raw.some((option) => option.isCorrect && !option.label)) {
      errors.push(`Row ${rowNumber}: a correct letter points at an empty option.`);
      continue;
    }

    const options = cleanOptions(raw);
    const validationError = validateQuestion(type, options);
    if (!values.prompt) {
      errors.push(`Row ${rowNumber}: Enter a prompt.`);
      continue;
    }
    if (validationError) {
      errors.push(`Row ${rowNumber}: ${validationError}`);
      continue;
    }

    questions.push({
      prompt: values.prompt,
      type: type as QuestionType,
      options,
    });
  }

  if (errors.length > 0) {
    const shown = errors.slice(0, 8);
    const extra = errors.length - shown.length;
    const summary = extra > 0 ? `${shown.join("\n")}\nAnd ${extra} more.` : shown.join("\n");
    return { error: summary };
  }

  if (questions.length === 0) return { error: "The Questions sheet has no questions." };
  return { questions };
}
