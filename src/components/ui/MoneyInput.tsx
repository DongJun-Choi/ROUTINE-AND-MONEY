import { formatNumber } from "@/lib/format";

interface MoneyInputProps {
  id?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  ariaLabel?: string;
  placeholder?: string;
  className?: string;
}

// 금액은 정수 원 단위로만 받는다. 붙여넣은 쉼표나 글자는 걸러 내고 표시할 때만 천 단위 쉼표를 붙인다.
const MAX_DIGITS = 12;

export default function MoneyInput({ id, value, onChange, ariaLabel, placeholder = "0", className = "" }: MoneyInputProps) {
  return (
    <span className={`flex h-11 min-w-0 items-center rounded-lg border border-line-strong bg-input transition-[border-color,box-shadow] focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15 ${className}`}>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value === null ? "" : formatNumber(value)}
        onChange={(event) => {
          const digits = event.target.value.replace(/[^0-9]/g, "").slice(0, MAX_DIGITS);
          onChange(digits === "" ? null : Number(digits));
        }}
        className="h-full min-w-0 flex-1 rounded-lg border-0 bg-transparent pr-1 pl-3 text-right text-[15px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-muted focus-visible:outline-none"
      />
      <span className="pr-3 pl-0.5 text-sm text-muted">원</span>
    </span>
  );
}
