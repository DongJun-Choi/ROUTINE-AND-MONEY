export interface YearMonth {
  year: number;
  month: number;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function shiftMonth({ year, month }: YearMonth, amount: number): YearMonth {
  const date = new Date(year, month - 1 + amount, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function weekdayLabel(weekday: number): string {
  return WEEKDAYS[weekday] ?? "";
}

export function compareYearMonth(a: YearMonth, b: YearMonth): number {
  return a.year * 12 + a.month - (b.year * 12 + b.month);
}

// 거래 날짜는 저장된 날짜 문자열(YYYY-MM-DD…)을 그대로 읽어 타임존에 따라 하루가 밀리지 않게 한다.
export function formatMonthDay(isoDate: string): string {
  return `${Number(isoDate.slice(5, 7))}월 ${Number(isoDate.slice(8, 10))}일`;
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function formatDayHeading(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return `${month}월 ${day}일 (${weekdayLabel(new Date(year, month - 1, day).getDay())})`;
}
