// Keep identical to backend/src/lib/tanzaku-dates.ts; verified by the T03 tests.
const DAY_MS = 86_400_000;

export function todayInJapan(now = new Date()): string {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function parseYmd(value: unknown): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

export function validateDeadline(value: unknown, today = todayInJapan()): string | null {
  if (value === null || value === undefined) return null;
  if (!parseYmd(value)) throw new Error("期限は実在する日付をYYYY-MM-DD形式で指定してください");
  if ((value as string) < today) throw new Error("期限は今日（日本時間）以降を選んでください");
  return value as string;
}

// Creation only. Reading or updating completion must never reschedule saved dates.
// Same-day steps are allowed. Without a deadline, use 14-day intervals.
export function makeStepDueDatesFromToday(total: number, deadline: string | null, today = todayInJapan()): string[] {
  if (!Number.isInteger(total) || total < 0) throw new Error("ステップ数が不正です");
  const start = parseYmd(today);
  if (!start) throw new Error("作成基準日が不正です");
  const end = validateDeadline(deadline, today);
  const span = end ? (parseYmd(end)!.getTime() - start.getTime()) / DAY_MS : null;
  return Array.from({ length: total }, (_, index) => {
    const days = span === null ? index * 14 : total <= 1 ? 0 : Math.floor(span * index / (total - 1));
    return new Date(start.getTime() + days * DAY_MS).toISOString().slice(0, 10);
  });
}
