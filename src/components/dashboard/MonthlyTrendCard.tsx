"use client";

import { useState } from "react";
import BarChart from "@/components/charts/BarChart";
import { Card, CardHeader } from "@/components/ui/Card";
import SegmentedControl from "@/components/ui/SegmentedControl";
import type { SeriesPoint } from "@/lib/dashboard/stats";
import { formatCompactWon, formatNumber } from "@/lib/format";

type TrendRange = "year" | "recent";

interface MonthlyTrendCardProps {
  yearSeries: SeriesPoint[];
  recentSeries: SeriesPoint[];
  className?: string;
}

function rangeLabel(series: SeriesPoint[]): string {
  const first = series[0];
  const last = series[series.length - 1];
  if (!first || !last) return "";
  if (first.year === last.year) return `${first.year}년 ${first.month}월 ~ ${last.month}월`;
  return `${first.year}년 ${first.month}월 ~ ${last.year}년 ${last.month}월`;
}

export default function MonthlyTrendCard({ yearSeries, recentSeries, className = "" }: MonthlyTrendCardProps) {
  const [range, setRange] = useState<TrendRange>("year");
  const series = range === "year" ? yearSeries : recentSeries;
  const label = rangeLabel(series);
  const selected = series.find((point) => point.highlight);
  const spentMonths = series.filter((point) => point.value > 0);
  const average = spentMonths.length > 0 ? Math.round(spentMonths.reduce((sum, point) => sum + point.value, 0) / spentMonths.length) : null;
  const lowest = spentMonths.reduce<SeriesPoint | null>((min, point) => (min === null || point.value < min.value ? point : min), null);

  return (
    <Card className={`gap-6 ${className}`}>
      <CardHeader
        title="월별 지출 추이"
        description={label}
        action={
          <SegmentedControl<TrendRange>
            label="기간"
            value={range}
            onChange={setRange}
            options={[
              { value: "year", label: "올해" },
              { value: "recent", label: "최근 12개월" },
            ]}
          />
        }
      />
      <BarChart
        ariaLabel={`${label} 월별 지출 막대 그래프.${selected ? ` ${selected.month}월 지출은 ${formatNumber(selected.value)}원` : ""}`}
        height={220}
        gap={8}
        barWidth="56%"
        barMaxWidth={32}
        highlightLabels
        hideMinorValuesOnMobile
        formatTick={formatCompactWon}
        data={series.map((point) => ({
          key: point.key,
          label: `${point.month}월`,
          value: point.value,
          highlight: point.highlight,
          valueLabel: point.value > 0 ? formatCompactWon(point.value) : undefined,
        }))}
      />
      {average !== null && lowest && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl border border-line bg-raised px-4 py-3 text-[13px] leading-5">
          <span className="font-semibold text-heading">월평균 {formatNumber(average)}원</span>
          <span className="text-muted">가장 적게 쓴 달 · {lowest.month}월 {formatNumber(lowest.value)}원</span>
        </div>
      )}
    </Card>
  );
}
