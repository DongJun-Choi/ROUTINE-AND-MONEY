"use client";

import { Minus, Plus, Users } from "lucide-react";
import { useState, type ButtonHTMLAttributes } from "react";
import AmountText from "@/components/ui/AmountText";
import Button from "@/components/ui/Button";
import { Dialog, OverlayHeader } from "@/components/ui/Overlay";
import ToggleChip from "@/components/ui/ToggleChip";
import { formatMonthDay } from "@/lib/date";
import { formatNumber } from "@/lib/format";
import { clampPeople, MAX_PEOPLE, MIN_PEOPLE, splitEvenly } from "@/lib/transactions/split";

interface NWaySplitDialogProps {
  open: boolean;
  amount: number;
  merchant: string;
  date: string;
  onClose: () => void;
  onApply: (share: number) => void;
}

const TITLE_ID = "n-way-split-title";
const QUICK_PEOPLE = [2, 3, 4, 5, 6];

function StepButton(props: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">) {
  return <button type="button" className="flex size-11 shrink-0 items-center justify-center rounded-[10px] border border-line-strong bg-surface text-heading transition-colors hover:bg-subtle disabled:text-line-strong disabled:hover:bg-surface" {...props} />;
}

export default function NWaySplitDialog(props: NWaySplitDialogProps) {
  if (!props.open) return null;
  return <NWaySplitBody {...props} />;
}

function NWaySplitBody({ amount, merchant, date, onClose, onApply }: NWaySplitDialogProps) {
  const [peopleInput, setPeopleInput] = useState(String(MIN_PEOPLE));
  const { people, share, hasRemainder } = splitEvenly(amount, Number(peopleInput));
  const setPeople = (value: number) => setPeopleInput(String(clampPeople(value)));

  return (
    <Dialog open onClose={onClose} labelledBy={TITLE_ID}>
      <OverlayHeader titleId={TITLE_ID} title="n빵 계산" description={`${merchant.trim() || "새 거래"} · ${formatMonthDay(date)}`} icon={<Users size={20} strokeWidth={1.8} />} onClose={onClose} />

      <div className="flex flex-col gap-4 rounded-xl border border-line bg-raised p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm leading-5 text-sub">전체 결제 금액</span>
          <strong className="text-base leading-[22px] font-bold whitespace-nowrap text-heading">{formatNumber(amount)}원</strong>
        </div>
        <div className="flex flex-col gap-2.5 border-t border-line pt-4">
          <label htmlFor="n-way-people" className="text-sm leading-5 font-semibold text-heading">나눌 인원</label>
          <div className="flex items-center gap-2">
            <StepButton aria-label="한 명 빼기" disabled={people <= MIN_PEOPLE} onClick={() => setPeople(people - 1)}>
              <Minus size={18} strokeWidth={2} aria-hidden="true" />
            </StepButton>
            <span className="relative min-w-0 flex-1">
              <input
                id="n-way-people"
                type="number"
                inputMode="numeric"
                min={MIN_PEOPLE}
                max={MAX_PEOPLE}
                data-autofocus
                value={peopleInput}
                onChange={(event) => setPeopleInput(event.target.value)}
                onBlur={() => setPeople(Number(peopleInput))}
                className="h-11 w-full [appearance:textfield] rounded-[10px] border border-line bg-input pr-9 pl-9 text-center text-lg font-bold text-heading outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 focus-visible:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted">명</span>
            </span>
            <StepButton aria-label="한 명 더하기" disabled={people >= MAX_PEOPLE} onClick={() => setPeople(people + 1)}>
              <Plus size={18} strokeWidth={2} aria-hidden="true" />
            </StepButton>
          </div>
          <div role="group" aria-label="자주 쓰는 인원" className="flex gap-1.5">
            {QUICK_PEOPLE.map((count) => (
              <ToggleChip key={count} active={people === count} onClick={() => setPeople(count)} className="min-w-0 flex-1 px-1 text-[13px]">{count}명</ToggleChip>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 rounded-xl border border-primary-line bg-primary-soft px-4 py-[18px] text-center">
        <span className="text-[13px] leading-[18px] font-semibold text-primary-soft-text">내 부담 금액</span>
        <strong aria-live="polite" className="text-[28px] leading-9 font-bold tracking-[-0.025em] text-heading">
          <AmountText value={formatNumber(share)} unitClassName="text-lg" />
        </strong>
        <span className="text-[13px] leading-[18px] text-sub">{formatNumber(amount)}원 ÷ {people}명</span>
        {hasRemainder && <span className="text-xs leading-4 text-primary-soft-text">1원 미만은 올림해서 내 금액에 반영해요</span>}
      </div>

      <p className="m-0 text-[13px] leading-5 text-muted">적용하면 이 거래의 금액이 내 부담 금액으로 바뀌고, 나눠 둔 카테고리는 해제돼요.</p>

      <footer className="flex justify-end gap-2">
        <Button onClick={onClose}>취소</Button>
        <Button variant="primary" onClick={() => onApply(share)}>이 금액 적용</Button>
      </footer>
    </Dialog>
  );
}
