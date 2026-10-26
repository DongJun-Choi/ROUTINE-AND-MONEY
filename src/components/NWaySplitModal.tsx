"use client";

import { Users, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  amount: number;
  onClose: () => void;
  onApply: (amount: number) => void;
}

export default function NWaySplitModal({ open, amount, onClose, onApply }: Props) {
  const [people, setPeople] = useState(2);
  useEffect(() => { if (open) setPeople(2); }, [open]);
  if (!open) return null;

  const safePeople = Math.min(50, Math.max(2, people || 2));
  const share = Math.ceil(amount / safePeople);
  const remainder = amount % safePeople;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <section className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="n-way-title">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Users size={20} className="text-violet-600" /><h2 id="n-way-title" className="font-semibold">n빵 계산</h2></div>
          <button onClick={onClose} aria-label="닫기"><X size={18} /></button>
        </header>
        <div className="mt-5 rounded-xl bg-gray-50 p-4 text-sm">
          <div className="flex justify-between text-gray-500"><span>전체 결제 금액</span><strong className="text-gray-900">{amount.toLocaleString()}원</strong></div>
          <label className="mt-4 block font-medium">나눌 인원수
            <div className="mt-2 flex items-center gap-2"><input type="number" min={2} max={50} value={people} onChange={(event) => setPeople(Number(event.target.value))} className="w-full rounded-lg border bg-white px-3 py-2 text-right" /><span>명</span></div>
          </label>
        </div>
        <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4 text-center">
          <p className="text-xs text-violet-700">내 부담 금액</p><strong className="mt-1 block text-2xl text-violet-950">{share.toLocaleString()}원</strong>
          {remainder > 0 && <p className="mt-2 text-xs text-violet-700">나머지 {remainder}원 중 1원을 내 금액에 반영합니다.</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2"><button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">취소</button><button onClick={() => onApply(share)} className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white">이 금액 적용</button></div>
      </section>
    </div>
  );
}
