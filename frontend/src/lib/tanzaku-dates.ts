import type { TanzakuStep } from "@/lib/api/tanzaku";

function parseYmd(ymd: string | null) {
  if (!ymd) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), 12);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatYmd(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function todayAtNoon() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
}

export function makeStepDueDatesFromToday(total: number, deadline: string | null) {
  if (total <= 0) return [];

  const start = todayAtNoon();
  const end = parseYmd(deadline);
  const useDeadline = end !== null && end.getTime() > start.getTime();

  return Array.from({ length: total }, (_, index) => {
    const date = new Date(start);

    if (useDeadline && total > 1) {
      date.setTime(start.getTime() + ((end.getTime() - start.getTime()) * index) / (total - 1));
    } else if (!useDeadline) {
      date.setDate(start.getDate() + index * 14);
    }

    return formatYmd(date);
  });
}

export function rebaseStepDueDatesFromToday<T extends TanzakuStep>(
  steps: T[],
  deadline: string | null,
) {
  const dueDates = makeStepDueDatesFromToday(steps.length, deadline);
  return steps.map((step, index) => ({
    ...step,
    dueDate: dueDates[index] ?? step.dueDate,
  }));
}
