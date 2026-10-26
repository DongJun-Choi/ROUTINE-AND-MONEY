import { Card, CardHeader } from "@/components/ui/Card";
import { formatNumber } from "@/lib/format";
import type { PaymentType } from "@/lib/types";

const PAYMENT_ROWS: { type: PaymentType; label: string; color: string }[] = [
  { type: "CARD", label: "카드", color: "var(--bar-current)" },
  { type: "MIXED", label: "복합 (카드 + 포인트)", color: "var(--mixed)" },
  { type: "POINT", label: "포인트", color: "var(--point)" },
];

export default function PaymentBreakdownCard({ totals, className = "" }: { totals: Record<PaymentType, number>; className?: string }) {
  const sum = PAYMENT_ROWS.reduce((total, row) => total + totals[row.type], 0);

  return (
    <Card className={`gap-4 ${className}`}>
      <CardHeader title="결제수단별 지출" />
      {sum === 0 ? (
        <p className="m-0 text-sm text-muted">이 달에는 지출 내역이 없어요</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
          {PAYMENT_ROWS.map((row) => (
            <li key={row.type} className="flex flex-col gap-1.5">
              <div className="flex justify-between gap-2 text-sm leading-5">
                <span className="text-sub">{row.label}</span>
                <span className="font-semibold whitespace-nowrap text-heading">{formatNumber(totals[row.type])}원</span>
              </div>
              <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-subtle">
                <div className="h-full rounded-full" style={{ width: `${(totals[row.type] / sum) * 100}%`, background: row.color }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
