import type { ReactNode } from "react";

interface StatBoxProps {
  label: ReactNode;
  value: ReactNode;
  className?: string;
}

export default function StatBox({ label, value, className = "" }: StatBoxProps) {
  return (
    <div className={`flex min-w-0 flex-col gap-1 rounded-xl border border-line bg-raised px-4 py-3.5 ${className}`}>
      <span className="text-xs leading-4 text-muted">{label}</span>
      <span className="text-base leading-[22px] font-bold whitespace-nowrap text-heading">{value}</span>
    </div>
  );
}
