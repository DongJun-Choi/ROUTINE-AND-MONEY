import type { ReactNode } from "react";

export type ChipTone = "neutral" | "primary" | "positive" | "pending" | "danger" | "point" | "mixed" | "inverse";

const toneClass: Record<ChipTone, string> = {
  neutral: "border-transparent bg-subtle text-sub",
  primary: "border-primary-line bg-primary-soft text-primary-soft-text",
  positive: "border-positive-line bg-positive-soft text-positive",
  pending: "border-pending-line bg-pending-soft text-pending",
  danger: "border-danger-line bg-danger-soft text-danger",
  point: "border-transparent bg-point-soft text-point",
  mixed: "border-transparent bg-mixed-soft text-mixed",
  inverse: "border-transparent bg-white/15 text-on-primary",
};

const sizeClass = {
  sm: "h-[22px] gap-1 px-[9px] text-[11px]",
  md: "h-6 gap-1 px-2.5 text-xs",
};

interface ChipProps {
  tone?: ChipTone;
  size?: keyof typeof sizeClass;
  bordered?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Chip({ tone = "neutral", size = "sm", bordered = false, icon, children, className = "" }: ChipProps) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full font-semibold whitespace-nowrap ${bordered ? "border" : "border-0"} ${toneClass[tone]} ${sizeClass[size]} ${className}`}>
      {icon}
      {children}
    </span>
  );
}
