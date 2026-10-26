import CategoryIcon from "@/components/transactions/CategoryIcon";
import Chip, { type ChipTone } from "@/components/ui/Chip";
import { formatNumber, formatTransactionAmount } from "@/lib/format";
import { categoryPath, paymentTypeShortLabel } from "@/lib/transactionDisplay";
import type { PaymentType, Transaction } from "@/lib/types";

const paymentTone: Record<PaymentType, ChipTone> = {
  CARD: "primary",
  MIXED: "mixed",
  POINT: "point",
};

function CategoryChips({ transaction }: { transaction: Transaction }) {
  if (transaction.splits?.length) {
    return (
      <>
        {transaction.splits.map((split) => (
          <Chip key={split.id}>{categoryPath(split.category) ?? "미분류"} {formatNumber(split.amount)}원</Chip>
        ))}
      </>
    );
  }
  const path = categoryPath(transaction.category);
  if (path) return <Chip>{path}</Chip>;
  return transaction.type === "EXPENSE" ? <Chip tone="pending" bordered>미분류</Chip> : null;
}

export default function TransactionListItem({ transaction, onSelect }: { transaction: Transaction; onSelect: (transaction: Transaction) => void }) {
  return (
    <li className="border-t border-subtle first:border-t-0">
      <button type="button" onClick={() => onSelect(transaction)} className="flex min-h-16 w-full items-center gap-3 px-3.5 py-3 text-left transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-raised">
        <CategoryIcon transaction={transaction} />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-sm leading-5 font-semibold text-heading">{transaction.merchant}</span>
          <span className="flex flex-wrap gap-1.5">
            <CategoryChips transaction={transaction} />
            <Chip tone={paymentTone[transaction.paymentType]}>{paymentTypeShortLabel[transaction.paymentType]}</Chip>
          </span>
        </span>
        <span className={`text-[15px] font-semibold whitespace-nowrap ${transaction.type === "INCOME" ? "text-positive" : "text-heading"}`}>
          {formatTransactionAmount(transaction.amount, transaction.type)}
        </span>
      </button>
    </li>
  );
}
