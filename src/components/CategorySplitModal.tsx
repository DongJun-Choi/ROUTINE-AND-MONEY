"use client";

import { Plus, Split, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Category { id: number; name: string; parentId: number | null }
export interface SplitDraft { amount: number; categoryId: number | null; label: string }
interface Props { open: boolean; totalAmount: number; categories: Category[]; initialSplits: SplitDraft[]; onClose: () => void; onApply: (splits: SplitDraft[]) => void }

export default function CategorySplitModal({ open, totalAmount, categories, initialSplits, onClose, onApply }: Props) {
  const [splits, setSplits] = useState<SplitDraft[]>([]);
  useEffect(() => {
    if (!open) return;
    setSplits(initialSplits.length >= 2 ? initialSplits : [
      { amount: Math.ceil(totalAmount / 2), categoryId: null, label: "" },
      { amount: Math.floor(totalAmount / 2), categoryId: null, label: "" },
    ]);
  }, [open, initialSplits, totalAmount]);
  if (!open) return null;

  const parents = categories.filter((category) => category.parentId === null);
  const total = splits.reduce((sum, split) => sum + (Number(split.amount) || 0), 0);
  const difference = totalAmount - total;
  const update = (index: number, value: Partial<SplitDraft>) => setSplits((current) => current.map((split, splitIndex) => splitIndex === index ? { ...split, ...value } : split));
  const canApply = splits.length >= 2 && difference === 0 && splits.every((split) => Number.isInteger(split.amount) && split.amount > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="category-split-title">
        <header className="flex items-center justify-between"><div className="flex items-center gap-2"><Split size={20} className="text-violet-600" /><div><h2 id="category-split-title" className="font-semibold">카테고리별 금액 나누기</h2><p className="text-xs text-gray-500">결제 금액을 항목별로 나누고 카테고리를 지정하세요.</p></div></div><button onClick={onClose} aria-label="닫기"><X size={18} /></button></header>
        <div className="mt-5 space-y-3">{splits.map((split, index) => (
          <div key={index} className="grid gap-2 rounded-xl border p-3 md:grid-cols-[1fr_150px_170px_auto]">
            <input value={split.label} onChange={(event) => update(index, { label: event.target.value })} placeholder={`항목 ${index + 1} (선택)`} maxLength={50} className="rounded-lg border px-3 py-2 text-sm" />
            <input type="number" min={1} value={split.amount} onChange={(event) => update(index, { amount: Number(event.target.value) })} className="rounded-lg border px-3 py-2 text-right text-sm" aria-label={`항목 ${index + 1} 금액`} />
            <select value={split.categoryId ?? ""} onChange={(event) => update(index, { categoryId: event.target.value ? Number(event.target.value) : null })} className="rounded-lg border bg-white px-3 py-2 text-sm" aria-label={`항목 ${index + 1} 카테고리`}>
              <option value="">미분류</option>{parents.map((parent) => <optgroup key={parent.id} label={parent.name}><option value={parent.id}>{parent.name}</option>{categories.filter((category) => category.parentId === parent.id).map((child) => <option key={child.id} value={child.id}>{child.name}</option>)}</optgroup>)}
            </select>
            <button onClick={() => setSplits((current) => current.filter((_, splitIndex) => splitIndex !== index))} disabled={splits.length <= 2} className="grid h-10 w-10 place-items-center rounded-lg text-red-500 hover:bg-red-50 disabled:text-gray-300" aria-label={`항목 ${index + 1} 삭제`}><Trash2 size={17} /></button>
          </div>
        ))}</div>
        <button onClick={() => setSplits((current) => [...current, { amount: Math.max(1, difference), categoryId: null, label: "" }])} className="mt-3 flex items-center gap-1 rounded-lg border px-3 py-2 text-sm"><Plus size={16} />항목 추가</button>
        <div className={`mt-5 flex items-center justify-between rounded-xl p-4 text-sm ${difference === 0 ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}><span>결제 금액 {totalAmount.toLocaleString()}원</span><strong>{difference === 0 ? "금액이 일치합니다" : difference > 0 ? `${difference.toLocaleString()}원 남음` : `${Math.abs(difference).toLocaleString()}원 초과`}</strong></div>
        <div className="mt-5 flex justify-end gap-2"><button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">취소</button><button disabled={!canApply} onClick={() => onApply(splits)} className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white disabled:bg-gray-300">분할 적용</button></div>
      </section>
    </div>
  );
}
