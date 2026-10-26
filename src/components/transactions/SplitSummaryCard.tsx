import { vizColor } from "@/components/charts/vizColor";
import { formatNumber } from "@/lib/format";
import type { SplitDraft } from "@/lib/transactions/split";
import { categoryPathById } from "@/lib/transactionDisplay";
import type { Category } from "@/lib/types";

interface SplitSummaryCardProps {
  splits: SplitDraft[];
  categories: Category[];
  onEdit: () => void;
  onClear: () => void;
}

export default function SplitSummaryCard({ splits, categories, onEdit, onClear }: SplitSummaryCardProps) {
  return (
    <section aria-labelledby="split-summary-title" className="flex flex-col gap-3 rounded-xl border border-primary-line bg-tone-indigo-soft p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 id="split-summary-title" className="m-0 text-sm leading-5 font-semibold text-tone-indigo">카테고리 {splits.length}개로 나눴어요</h3>
          <p className="m-0 text-xs leading-4 text-tone-indigo">대시보드에는 항목별 카테고리로 집계돼요</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={onEdit} className="min-h-11 rounded-[10px] px-3 text-[13px] font-semibold text-tone-indigo transition-colors hover:bg-surface">수정</button>
          <button type="button" onClick={onClear} className="min-h-11 rounded-[10px] px-3 text-[13px] font-semibold text-danger transition-colors hover:bg-surface">분할 해제</button>
        </div>
      </div>
      <ul className="m-0 flex list-none flex-col rounded-[10px] border border-line bg-surface p-0">
        {splits.map((split, index) => (
          <li key={index} className="flex items-center gap-2.5 border-t border-subtle px-3 py-2.5 first:border-t-0">
            <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[3px]" style={{ background: vizColor(index) }} />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm leading-5 font-semibold text-heading">{split.label || `항목 ${index + 1}`}</span>
              <span className="truncate text-xs leading-4 text-muted">{categoryPathById(categories, split.categoryId) ?? "미분류"}</span>
            </span>
            <span className="text-sm font-semibold whitespace-nowrap text-heading">{formatNumber(split.amount)}원</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
