import { Card, CardHeader } from "@/components/ui/Card";
import { daysInMonth } from "@/lib/date";
import { formatNumber, formatShortWon } from "@/lib/format";
import type { DayTotals } from "@/lib/transactions/summary";

interface TransactionCalendarProps {
  year: number;
  month: number;
  dailyTotals: Record<string, DayTotals>;
  selectedDate: string | null;
  todayKey: string;
  onSelectDate: (dateKey: string) => void;
  className?: string;
}

const WEEKDAY_HEADERS = [
  { label: "일", className: "text-danger" },
  { label: "월", className: "text-muted" },
  { label: "화", className: "text-muted" },
  { label: "수", className: "text-muted" },
  { label: "목", className: "text-muted" },
  { label: "금", className: "text-muted" },
  { label: "토", className: "text-primary-text" },
];

// 지출 단계 구간은 토큰 보드의 달력 범례(~6만, ~10만, ~15만, 15만+)를 따른다.
function heatColor(expense: number): string {
  if (expense <= 0) return "transparent";
  if (expense < 60_000) return "var(--heat-1)";
  if (expense < 100_000) return "var(--heat-2)";
  if (expense < 150_000) return "var(--heat-3)";
  return "var(--heat-4)";
}

export default function TransactionCalendar({ year, month, dailyTotals, selectedDate, todayKey, onSelectDate, className = "" }: TransactionCalendarProps) {
  const leadingBlanks = new Date(year, month - 1, 1).getDay();
  const days = Array.from({ length: daysInMonth(year, month) }, (_, index) => {
    const day = index + 1;
    const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return { day, key, totals: dailyTotals[key] ?? { expense: 0, income: 0 } };
  });

  return (
    <Card className={`gap-4 ${className}`}>
      <CardHeader title={`${month}월 달력`} description="날짜를 누르면 그날 내역으로 이동해요" />
      <div aria-hidden="true" className="grid grid-cols-7 gap-1 text-center text-xs font-semibold sm:gap-1.5">
        {WEEKDAY_HEADERS.map((weekday) => <span key={weekday.label} className={weekday.className}>{weekday.label}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {Array.from({ length: leadingBlanks }, (_, index) => <span key={`blank-${index}`} aria-hidden="true" />)}
        {days.map(({ day, key, totals }) => {
          const selected = key === selectedDate;
          const isToday = key === todayKey;
          const isFuture = key > todayKey;
          const parts = [totals.expense > 0 ? `지출 ${formatNumber(totals.expense)}원` : "", totals.income > 0 ? `수입 ${formatNumber(totals.income)}원` : ""].filter(Boolean);
          return (
            <button
              key={key}
              type="button"
              aria-label={`${month}월 ${day}일${isToday ? " 오늘" : ""} ${parts.length ? parts.join(", ") : "내역 없음"}`}
              aria-pressed={selected}
              onClick={() => onSelectDate(key)}
              className={`flex min-h-[52px] min-w-0 flex-col items-center gap-0.5 rounded-[10px] px-0.5 py-1.5 transition-shadow hover:ring-1 hover:ring-line-strong sm:min-h-[60px] sm:gap-1 sm:py-[7px] ${selected ? "ring-2 ring-primary ring-inset hover:ring-2 hover:ring-primary" : ""}`}
              style={{ background: heatColor(totals.expense) }}
            >
              <span className={`text-[13px] leading-4 ${isToday ? "font-bold" : "font-medium"} ${isFuture ? "text-muted" : "text-heading"}`}>{day}</span>
              {totals.expense > 0 && <span className="text-[10px] leading-3 font-medium whitespace-nowrap text-sub sm:text-[11px] sm:leading-[14px]">{formatShortWon(totals.expense)}</span>}
              {totals.income > 0 && <span className="text-[10px] leading-3 font-medium whitespace-nowrap text-positive sm:text-[11px] sm:leading-[14px]">+{formatShortWon(totals.income)}</span>}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-end gap-1.5 text-xs text-muted">
        <span>적게</span>
        {[1, 2, 3, 4].map((level) => (
          <span key={level} aria-hidden="true" className="size-3.5 rounded border border-line" style={{ background: `var(--heat-${level})` }} />
        ))}
        <span>많이</span>
      </div>
    </Card>
  );
}
