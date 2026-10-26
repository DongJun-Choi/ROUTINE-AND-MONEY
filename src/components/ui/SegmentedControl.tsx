import type { ReactNode } from "react";

interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  stretch?: boolean;
  className?: string;
}

export default function SegmentedControl<T extends string>({ label, options, value, onChange, stretch = false, className = "" }: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={label} className={`flex gap-0.5 rounded-[10px] border border-segment-line bg-segment p-[3px] ${className}`}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`min-h-[38px] rounded-lg px-3.5 text-[13px] whitespace-nowrap transition-colors ${stretch ? "min-w-0 flex-1 px-2" : ""} ${active ? "bg-segment-active font-semibold text-segment-active-text shadow-segment" : "font-medium text-icon hover:text-heading"}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
