"use client";

import { Plus, Split, Trash2 } from "lucide-react";
import { useState } from "react";
import CategorySelect from "@/components/category/CategorySelect";
import { vizColor } from "@/components/charts/vizColor";
import Button from "@/components/ui/Button";
import MoneyInput from "@/components/ui/MoneyInput";
import { Dialog, OverlayHeader } from "@/components/ui/Overlay";
import TextInput from "@/components/ui/TextInput";
import { formatNumber } from "@/lib/format";
import { evaluateSplits, initialSplitDrafts, MAX_SPLITS, MIN_SPLITS, nextSplitDraft, SPLIT_LABEL_MAX_LENGTH, type SplitDraft } from "@/lib/transactions/split";
import type { Category } from "@/lib/types";

interface CategorySplitDialogProps {
  open: boolean;
  totalAmount: number;
  merchant: string;
  categories: Category[];
  initialSplits: SplitDraft[];
  onClose: () => void;
  onApply: (splits: SplitDraft[]) => void;
}

const TITLE_ID = "category-split-title";
const ROW_GRID = "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px] gap-2 sm:grid-cols-[minmax(0,1fr)_140px_190px_44px]";

function splitStatus(difference: number, hasEmpty: boolean): { text: string; className: string } {
  const pending = "border-pending-line bg-pending-soft text-pending";
  if (hasEmpty) return { text: "금액이 비어 있는 항목이 있어요", className: pending };
  if (difference > 0) return { text: `${formatNumber(difference)}원 남았어요`, className: pending };
  if (difference < 0) return { text: `${formatNumber(-difference)}원 넘었어요`, className: "border-danger-line bg-danger-soft text-danger" };
  return { text: "금액이 딱 맞아요", className: "border-positive-line bg-positive-soft text-positive" };
}

export default function CategorySplitDialog(props: CategorySplitDialogProps) {
  if (!props.open) return null;
  return <CategorySplitBody {...props} />;
}

function CategorySplitBody({ totalAmount, merchant, categories, initialSplits, onClose, onApply }: CategorySplitDialogProps) {
  const [drafts, setDrafts] = useState<SplitDraft[]>(() => initialSplitDrafts(totalAmount, initialSplits));
  const { allocated, difference, hasEmpty, canApply } = evaluateSplits(totalAmount, drafts);
  const status = splitStatus(difference, hasEmpty);
  const removable = drafts.length > MIN_SPLITS;

  const update = (index: number, patch: Partial<SplitDraft>) => setDrafts((current) => current.map((draft, draftIndex) => (draftIndex === index ? { ...draft, ...patch } : draft)));

  let used = 0;
  const segments = drafts.map((draft, index) => {
    const part = Math.max(0, Math.min(draft.amount, totalAmount - used));
    used += part;
    return { key: index, width: totalAmount > 0 ? `${(part / totalAmount) * 100}%` : "0%", color: vizColor(index) };
  });

  return (
    <Dialog open size="lg" onClose={onClose} labelledBy={TITLE_ID}>
      <OverlayHeader
        titleId={TITLE_ID}
        title="카테고리 나누기"
        description={`${merchant.trim() || "이 거래"} ${formatNumber(totalAmount)}원을 품목별로 나누고 카테고리를 정해요`}
        icon={<Split size={20} strokeWidth={1.8} />}
        onClose={onClose}
      />

      <div className="flex flex-col gap-2">
        <div aria-hidden="true" className={`${ROW_GRID} max-sm:hidden px-[9px] text-xs leading-4 font-semibold text-muted`}>
          <span className="pl-[18px]">항목</span>
          <span className="pr-3 text-right">금액</span>
          <span>카테고리</span>
          <span />
        </div>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {drafts.map((draft, index) => (
            <li key={index} className={`${ROW_GRID} items-center rounded-xl border border-line bg-surface p-2`}>
              <span className="col-span-2 flex min-w-0 items-center gap-2 sm:col-span-1">
                <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[3px]" style={{ background: vizColor(index) }} />
                <TextInput
                  aria-label={`항목 ${index + 1} 이름`}
                  value={draft.label}
                  maxLength={SPLIT_LABEL_MAX_LENGTH}
                  onChange={(event) => update(index, { label: event.target.value.slice(0, SPLIT_LABEL_MAX_LENGTH) })}
                  placeholder={`항목 ${index + 1} (선택)`}
                  wrapperClassName="min-w-0 flex-1"
                  className="text-sm"
                />
              </span>
              <button
                type="button"
                aria-label={`항목 ${index + 1} 삭제`}
                disabled={!removable}
                onClick={() => setDrafts((current) => current.filter((_, draftIndex) => draftIndex !== index))}
                className="col-start-3 row-start-1 flex size-11 items-center justify-center rounded-[10px] text-danger transition-colors hover:bg-danger-soft disabled:text-line-strong disabled:hover:bg-transparent sm:col-start-4"
              >
                <Trash2 size={18} strokeWidth={1.8} aria-hidden="true" />
              </button>
              <MoneyInput
                ariaLabel={`항목 ${index + 1} 금액`}
                value={draft.amount > 0 ? draft.amount : null}
                onChange={(value) => update(index, { amount: value ?? 0 })}
                className="col-start-1 row-start-2 sm:col-start-2 sm:row-start-1"
              />
              <CategorySelect
                aria-label={`항목 ${index + 1} 카테고리`}
                categories={categories}
                value={draft.categoryId}
                onChange={(categoryId) => update(index, { categoryId })}
                emptyLabel="미분류"
                className="col-span-2 col-start-2 row-start-2 sm:col-span-1 sm:col-start-3 sm:row-start-1"
              />
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button onClick={() => setDrafts((current) => [...current, nextSplitDraft(difference)])} disabled={drafts.length >= MAX_SPLITS}>
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
            항목 추가
          </Button>
          <span className="text-xs leading-4 text-muted">항목은 2개 이상이어야 해요 · 새 항목에는 남은 금액이 채워져요</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div aria-hidden="true" className="flex h-2.5 overflow-hidden rounded-full bg-subtle">
          {segments.map((segment) => <span key={segment.key} className="h-full shrink-0" style={{ width: segment.width, background: segment.color }} />)}
        </div>
        <div className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border px-4 py-3.5 ${status.className}`}>
          <span className="text-[13px] leading-[18px]">결제 금액 {formatNumber(totalAmount)}원 · 나눈 금액 {formatNumber(allocated)}원</span>
          <strong aria-live="polite" className="text-sm leading-5 font-semibold">{status.text}</strong>
        </div>
      </div>

      <footer className="flex justify-end gap-2">
        <Button onClick={onClose}>취소</Button>
        <Button variant="primary" disabled={!canApply} onClick={() => onApply(drafts)}>분할 적용</Button>
      </footer>
    </Dialog>
  );
}
