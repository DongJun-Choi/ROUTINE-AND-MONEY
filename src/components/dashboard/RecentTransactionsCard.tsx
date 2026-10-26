import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CategoryIcon from "@/components/transactions/CategoryIcon";
import { Card, CardHeader } from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import { formatMonthDay } from "@/lib/date";
import { formatTransactionAmount } from "@/lib/format";
import { transactionCategoryLabel } from "@/lib/transactionDisplay";
import type { Transaction } from "@/lib/types";

interface RecentTransactionsCardProps {
  transactions: Transaction[];
  className?: string;
}

function TransactionSummaryRow({ transaction }: { transaction: Transaction }) {
  const label = transactionCategoryLabel(transaction) ?? (transaction.type === "INCOME" ? "수입" : null);
  const date = formatMonthDay(transaction.date);

  return (
    <li className="flex items-center gap-3 border-t border-subtle py-3 first:border-t-0">
      <CategoryIcon transaction={transaction} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm leading-5 font-semibold text-heading">{transaction.merchant}</span>
        {label ? (
          <span className="truncate text-xs leading-4 text-muted">{label} · {date}</span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs leading-4 whitespace-nowrap text-muted">
            <Chip tone="pending" bordered className="h-5 px-2">미분류</Chip>
            {date}
          </span>
        )}
      </div>
      <span className={`text-sm font-semibold whitespace-nowrap ${transaction.type === "INCOME" ? "text-positive" : "text-heading"}`}>
        {formatTransactionAmount(transaction.amount, transaction.type)}
      </span>
    </li>
  );
}

export default function RecentTransactionsCard({ transactions, className = "" }: RecentTransactionsCardProps) {
  return (
    <Card className={`gap-3 ${className}`}>
      <CardHeader
        title="최근 거래"
        description="가계부에 반영된 최신 내역"
        action={
          <Link href="/transactions" className="inline-flex min-h-11 items-center gap-1 px-1 text-sm font-semibold whitespace-nowrap text-primary-text hover:underline">
            전체 보기
            <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
          </Link>
        }
      />
      {transactions.length === 0 ? (
        <p className="m-0 flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-line-strong text-sm text-muted">이 달에는 거래 내역이 없어요</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {transactions.map((transaction) => <TransactionSummaryRow key={transaction.id} transaction={transaction} />)}
        </ul>
      )}
    </Card>
  );
}
