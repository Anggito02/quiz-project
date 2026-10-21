export const STUDENT_EMAIL_DOMAIN = "students.local";

export function studentEmail(number: string) {
  return `serdik.${number}@${STUDENT_EMAIL_DOMAIN}`;
}

export function studentPassword(pin: string) {
  return `Serdik-${pin}!`;
}

export function isStudentEmail(email: string) {
  return /^serdik\.[0-9]+@students\.local$/i.test(email.trim());
}

export function normalizeStudentNumber(value: string) {
  return value.trim();
}

export function normalizePin(value: string) {
  const pin = value.trim();
  if (!/^\d{6}$/.test(pin)) return null;
  return pin;
}
