import { Info } from "lucide-react";
import DonutChart from "@/components/charts/DonutChart";
import { vizColor } from "@/components/charts/vizColor";
import { Card, CardHeader } from "@/components/ui/Card";
import type { CategoryGroup, DashboardView } from "@/lib/dashboard/stats";
import { formatNumber, formatPercent } from "@/lib/format";

interface CategoryBreakdownCardProps {
  month: number;
  groups: CategoryGroup[];
  total: number;
  insight: DashboardView["categoryInsight"];
  className?: string;
}

function InsightText({ insight }: { insight: NonNullable<DashboardView["categoryInsight"]> }) {
  const magnitude = Math.round(Math.abs(insight.changePercent));
  if (magnitude === 0) return <>{insight.name} 지출이 지난달과 비슷해요.</>;
  return (
    <>
      {insight.name} 지출이 지난달보다 <strong className="font-semibold text-primary-text">{magnitude}% {insight.changePercent < 0 ? "줄었어요" : "늘었어요"}</strong>.
    </>
  );
}

export default function CategoryBreakdownCard({ month, groups, total, insight, className = "" }: CategoryBreakdownCardProps) {
  const ariaLabel = `카테고리별 지출 비중: ${groups.map((group) => `${group.name} ${formatPercent(group.share)}`).join(", ")}`;

  return (
    <Card className={`gap-6 ${className}`}>
      <CardHeader title="카테고리별 지출" description={`대분류 기준 · ${month}월`} />
      {total === 0 ? (
        <p className="m-0 flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-line-strong text-sm text-muted">이 달에는 지출 내역이 없어요</p>
      ) : (
        <div className="flex flex-1 flex-wrap items-center justify-center gap-7">
          <DonutChart className="size-[168px] sm:size-[200px]" ariaLabel={ariaLabel} segments={groups.map((group, index) => ({ key: group.key, value: group.amount, color: vizColor(index) }))}>
            <span className="text-[11px] leading-[14px] text-muted sm:text-xs sm:leading-4">{month}월 총 지출</span>
            <span className="text-[15px] leading-5 font-bold tracking-[-0.02em] text-heading sm:text-[17px] sm:leading-6">{formatNumber(total)}원</span>
          </DonutChart>
          <ul className="m-0 flex min-w-0 flex-[1_1_200px] list-none flex-col gap-3 p-0">
            {groups.map((group, index) => (
              <li key={group.key} className="flex items-center gap-2.5 text-sm leading-5">
                <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[3px]" style={{ background: vizColor(index) }} />
                <span className="min-w-0 flex-1 truncate text-sub">{group.name}</span>
                <span className="font-semibold whitespace-nowrap text-heading">{formatNumber(group.amount)}원</span>
                <span className="w-9 text-right text-[13px] text-muted">{formatPercent(group.share)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {insight && (
        <div className="flex items-start gap-2.5 rounded-xl border border-line bg-raised px-4 py-3.5 text-[13px] leading-5 text-sub">
          <Info size={18} strokeWidth={2} aria-hidden="true" className="mt-px shrink-0 text-primary-text" />
          <p className="m-0"><InsightText insight={insight} /></p>
        </div>
      )}
    </Card>
  );
}
