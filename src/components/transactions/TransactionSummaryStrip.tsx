import AmountText from "@/components/ui/AmountText";
import { formatNumber, formatSignedNumber } from "@/lib/format";
import type { TransactionTotals } from "@/lib/transactions/summary";

// 모바일 2열, 데스크톱 4열에서 칸 사이 구분선이 겹치지 않도록 위치마다 테두리를 정한다.
const cellBorder = ["", "border-l", "border-t sm:border-t-0 sm:border-l", "border-l border-t sm:border-t-0"];

export default function TransactionSummaryStrip({ month, totals }: { month: number; totals: TransactionTotals }) {
  const items = [
    { label: "지출", value: formatSignedNumber(-totals.expense), unit: "원", className: "" },
    { label: "수입", value: formatSignedNumber(totals.income), unit: "원", className: totals.income > 0 ? "text-positive" : "" },
    { label: "합계", value: formatSignedNumber(totals.net), unit: "원", className: totals.net > 0 ? "text-positive" : "" },
    { label: "거래 건수", value: formatNumber(totals.count), unit: "건", className: "" },
  ];

  return (
    <section aria-label={`${month}월 요약`} className="grid grid-cols-2 rounded-2xl border border-line bg-surface p-2 shadow-card sm:grid-cols-4">
      {items.map((item, index) => (
        <div key={item.label} className={`flex min-w-0 flex-col gap-1 border-subtle px-3.5 py-3 sm:px-[18px] sm:py-3.5 ${cellBorder[index]}`}>
          <span className="text-[13px] leading-[18px] font-medium text-muted">{item.label}</span>
          <AmountText value={item.value} unit={item.unit} className={`text-lg leading-7 font-bold tracking-[-0.02em] text-heading sm:text-[22px] sm:leading-[30px] ${item.className}`} unitClassName="text-sm sm:text-[15px]" />
        </div>
      ))}
    </section>
  );
}
