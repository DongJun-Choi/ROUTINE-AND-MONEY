import BarChart from "@/components/charts/BarChart";
import { Card, CardHeader } from "@/components/ui/Card";
import StatBox from "@/components/ui/StatBox";
import type { DailySummary } from "@/lib/dashboard/stats";
import { weekdayLabel, type YearMonth } from "@/lib/date";
import { formatCompactWon, formatNumber, formatPercent } from "@/lib/format";

interface DailySpendingCardProps {
  period: YearMonth;
  daily: DailySummary;
  isCurrentMonth: boolean;
  className?: string;
}

const LABELED_DAYS = [1, 5, 10, 15, 20, 25];

export default function DailySpendingCard({ period, daily, isCurrentMonth, className = "" }: DailySpendingCardProps) {
  const { points, elapsedDays, average, peak, weekendShare } = daily;
  const lastDay = points.length;
  const description = elapsedDays > 0 ? `${period.month}월 1일 ~ ${period.month}월 ${isCurrentMonth ? elapsedDays : lastDay}일` : `${period.month}월은 아직 시작하지 않았어요`;

  return (
    <Card className={`gap-6 ${className}`}>
      <CardHeader title="일별 지출" description={description} />
      <BarChart
        ariaLabel={`${period.month}월 일별 지출 막대 그래프.${peak ? ` 가장 많이 쓴 날은 ${peak.day}일 ${formatNumber(peak.value)}원` : " 지출 내역이 없습니다"}`}
        height={180}
        gap={4}
        barWidth="70%"
        barMaxWidth={14}
        formatTick={formatCompactWon}
        data={points.map((point) => ({
          key: String(point.day),
          label: LABELED_DAYS.includes(point.day) || point.day === lastDay ? String(point.day) : "",
          value: point.value,
          highlight: point.day === peak?.day || (isCurrentMonth && point.day === elapsedDays),
          tooltip: point.day === peak?.day ? `${point.day}일 · ${formatNumber(point.value)}원` : undefined,
        }))}
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(160px,100%),1fr))] gap-3">
        <StatBox label="하루 평균" value={elapsedDays > 0 ? `${formatNumber(average)}원` : "—"} />
        <StatBox label="가장 많이 쓴 날" value={peak ? `${peak.day}일 (${weekdayLabel(peak.weekday)}) ${formatNumber(peak.value)}원` : "—"} />
        <StatBox label="주말 지출 비중" value={weekendShare === null ? "—" : formatPercent(weekendShare)} />
      </div>
    </Card>
  );
}
