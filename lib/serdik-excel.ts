import type ExcelJS from "exceljs";
import { normalizePin } from "@/lib/serdik";

async function loadExcel() {
  return (await import("exceljs")).default;
}

export const MAX_SERDIK_BYTES = 2 * 1024 * 1024;

const HEADERS = ["nomor siswa", "nama siswa", "kelas", "pin"] as const;

export type SerdikRow = {
  studentNumber: string;
  name: string;
  className: string;
  pin: string;
};

function cellText(cell: ExcelJS.Cell) {
  return String(cell.text ?? "").replace(/\s+/g, " ").trim();
}

function pinFromCell(cell: ExcelJS.Cell) {
  const value = cell.value;
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.trunc(value)).padStart(6, "0");
  }
  const text = cellText(cell).replace(/\s+/g, "");
  if (/^\d{1,6}$/.test(text)) return text.padStart(6, "0");
  return text;
}

function numberFromCell(cell: ExcelJS.Cell) {
  const value = cell.value;
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }
  return cellText(cell);
}

function headerKey(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function normalizeClassName(value: string) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  const match = trimmed.match(/^kelas\s+(.+)$/i);
  return match ? match[1].trim() : trimmed;
}

export async function parseSerdikWorkbook(bytes: Buffer): Promise<
  { rows: SerdikRow[] } | { error: string }
> {
  const Excel = await loadExcel();
  const workbook = new Excel.Workbook();
  try {
    await workbook.xlsx.load(bytes as unknown as Parameters<ExcelJS.Xlsx["load"]>[0]);
  } catch {
    return { error: "That file could not be read. Upload an .xlsx workbook." };
  }

  if (workbook.worksheets.length === 0) {
    return { error: "That workbook has no sheets." };
  }

  try {
    return readSheets(workbook);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not read that workbook." };
  }
}

function readSheets(workbook: ExcelJS.Workbook): { rows: SerdikRow[] } {
  const rows: SerdikRow[] = [];
  const numbers = new Set<string>();
  const names = new Set<string>();

  for (const sheet of workbook.worksheets) {
    const header = sheet.getRow(1);
    const labels = [1, 2, 3, 4].map((col) => headerKey(cellText(header.getCell(col))));
    if (labels.some((label, index) => label !== HEADERS[index])) {
      throw new Error(
        `Sheet "${sheet.name}" must start with Nomor Siswa, Nama Siswa, Kelas, PIN.`,
      );
    }

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const studentNumber = numberFromCell(row.getCell(1));
      const name = cellText(row.getCell(2));
      const className = normalizeClassName(cellText(row.getCell(3)));
      const pin = pinFromCell(row.getCell(4));
      if (!studentNumber && !name && !className && !pin) return;

      if (!studentNumber || !/^[0-9]+$/.test(studentNumber)) {
        throw new Error(`Sheet "${sheet.name}" row ${rowNumber}: enter a student number.`);
      }
      if (!name) {
        throw new Error(`Sheet "${sheet.name}" row ${rowNumber}: enter a name.`);
      }
      if (!className) {
        throw new Error(`Sheet "${sheet.name}" row ${rowNumber}: enter a class.`);
      }
      if (!normalizePin(pin)) {
        throw new Error(`Sheet "${sheet.name}" row ${rowNumber}: PIN must be 6 digits.`);
      }
      if (numbers.has(studentNumber)) {
        throw new Error(`Student number ${studentNumber} appears more than once.`);
      }
      const nameKey = name.toLowerCase();
      if (names.has(nameKey)) {
        throw new Error(`Name "${name}" appears more than once.`);
      }

      numbers.add(studentNumber);
      names.add(nameKey);
      rows.push({ studentNumber, name, className, pin });
    });
  }

  if (rows.length === 0) {
    throw new Error("That workbook has no students.");
  }

  return { rows };
}
