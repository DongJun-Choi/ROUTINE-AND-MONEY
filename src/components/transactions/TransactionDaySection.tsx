import TransactionListItem from "@/components/transactions/TransactionListItem";
import Chip from "@/components/ui/Chip";
import { formatDayHeading } from "@/lib/date";
import { formatNumber } from "@/lib/format";
import type { TransactionDayGroup } from "@/lib/transactions/summary";
import type { Transaction } from "@/lib/types";

interface TransactionDaySectionProps {
  group: TransactionDayGroup;
  isToday: boolean;
  onSelect: (transaction: Transaction) => void;
}

export default function TransactionDaySection({ group, isToday, onSelect }: TransactionDaySectionProps) {
  return (
    <section id={`day-${group.date}`} aria-label={formatDayHeading(group.date)} className="flex scroll-mt-24 flex-col gap-2">
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-sm leading-5 font-semibold text-sub">{formatDayHeading(group.date)}</h3>
          {isToday && <Chip tone="primary">오늘</Chip>}
        </div>
        <span className="text-[13px] whitespace-nowrap text-muted">
          {group.expense > 0 && <>−{formatNumber(group.expense)}원</>}
          {group.expense > 0 && group.income > 0 && " · "}
          {group.income > 0 && <span className="text-positive">+{formatNumber(group.income)}원</span>}
        </span>
      </div>
      <ul className="m-0 flex list-none flex-col rounded-xl border border-subtle p-0">
        {group.transactions.map((transaction) => <TransactionListItem key={transaction.id} transaction={transaction} onSelect={onSelect} />)}
      </ul>
    </section>
  );
}
