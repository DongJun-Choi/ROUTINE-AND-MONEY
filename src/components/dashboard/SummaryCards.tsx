import { TrendingDown, TrendingUp } from "lucide-react";
import KpiCard from "@/components/dashboard/KpiCard";
import AmountText from "@/components/ui/AmountText";
import Chip from "@/components/ui/Chip";
import type { DashboardView } from "@/lib/dashboard/stats";
import { formatNumber, formatPercent, formatSignedNumber } from "@/lib/format";

const cardSizing = "shrink-0 basis-[260px] snap-start sm:flex-[1_1_220px]";
const unitClass = "text-base lg:text-lg";

function ExpenseChangeChip({ changePercent }: { changePercent: number | null }) {
  if (changePercent === null) return null;
  const magnitude = Math.abs(changePercent);
  if (magnitude < 0.05) return <Chip size="md">변동 없음</Chip>;
  const label = `${magnitude.toFixed(1)}%`;
  return changePercent < 0 ? (
    <Chip size="md" tone="positive" bordered icon={<TrendingDown size={14} strokeWidth={2} aria-hidden="true" />}>{label} 감소</Chip>
  ) : (
    <Chip size="md" tone="danger" bordered icon={<TrendingUp size={14} strokeWidth={2} aria-hidden="true" />}>{label} 증가</Chip>
  );
}

function expenseCaption({ amount, previous }: DashboardView["expense"]): string {
  if (previous <= 0) return "지난달 지출 내역이 없어요";
  const difference = amount - previous;
  if (difference < 0) return `지난달보다 ${formatNumber(-difference)}원 적게 썼어요`;
  if (difference > 0) return `지난달보다 ${formatNumber(difference)}원 더 썼어요`;
  return "지난달과 같은 금액을 썼어요";
}

export default function SummaryCards({ month, view }: { month: number; view: DashboardView }) {
  const { expense, income, net, transactionCount } = view;
  const top = view.topCategory;

  return (
    <section aria-label={`${month}월 요약`} className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0">
      <KpiCard
        className={cardSizing}
        title={`${month}월 지출`}
        badge={<ExpenseChangeChip changePercent={expense.changePercent} />}
        value={<AmountText value={formatNumber(expense.amount)} unitClassName={unitClass} />}
        caption={expenseCaption(expense)}
      />
      <KpiCard
        className={cardSizing}
        title="수입 · 환급"
        badge={<Chip size="md">{income.count}건</Chip>}
        value={<AmountText value={`+${formatNumber(income.amount)}`} className="text-positive" unitClassName={unitClass} />}
        caption={income.count > 0 ? "수입으로 기록된 거래의 합계예요" : "이 달에는 수입 내역이 없어요"}
      />
      <KpiCard
        className={cardSizing}
        title="순수익"
        badge={<Chip size="md">수입 − 지출</Chip>}
        value={<AmountText value={formatSignedNumber(net)} className={net > 0 ? "text-positive" : ""} unitClassName={unitClass} />}
        caption={`거래 ${formatNumber(transactionCount)}건 기준`}
      />
      <KpiCard
        className={cardSizing}
        emphasis
        title="가장 많이 쓴 카테고리"
        badge={top && <Chip size="md" tone="inverse">{formatPercent(top.share)}</Chip>}
        value={top ? top.name : "없음"}
        caption={top ? `${formatNumber(top.amount)}원 · ${month}월 지출의 ${formatPercent(top.share)}` : "분류된 지출이 아직 없어요"}
      >
        {top && (
          <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white" style={{ width: formatPercent(top.share) }} />
          </div>
        )}
      </KpiCard>
    </section>
  );
}
