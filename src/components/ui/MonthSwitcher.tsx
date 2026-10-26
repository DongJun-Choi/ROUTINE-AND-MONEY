import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthSwitcherProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  className?: string;
}

const stepButtonClass = "flex size-11 items-center justify-center rounded-[10px] text-sub transition-colors hover:bg-subtle disabled:text-line-strong disabled:hover:bg-transparent";

export default function MonthSwitcher({ year, month, onPrev, onNext, nextDisabled = false, className = "" }: MonthSwitcherProps) {
  return (
    <div role="group" aria-label="조회 월" className={`flex items-center justify-between rounded-xl border border-line bg-surface p-px ${className}`}>
      <button type="button" aria-label="이전 달" onClick={onPrev} className={stepButtonClass}>
        <ChevronLeft size={18} strokeWidth={2} aria-hidden="true" />
      </button>
      <span aria-live="polite" className="px-1.5 text-[15px] font-semibold whitespace-nowrap text-heading">{year}년 {month}월</span>
      <button type="button" aria-label="다음 달" onClick={onNext} disabled={nextDisabled} className={stepButtonClass}>
        <ChevronRight size={18} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}
