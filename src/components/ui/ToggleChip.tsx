import type { ButtonHTMLAttributes } from "react";

interface ToggleChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  active: boolean;
  variant?: "soft" | "solid";
}

const activeClass = {
  soft: "border-primary bg-primary-soft font-semibold text-primary-soft-text",
  solid: "border-primary bg-primary font-semibold text-on-primary",
};

export default function ToggleChip({ active, variant = "soft", className = "", ...props }: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border px-4 text-sm whitespace-nowrap transition-colors disabled:opacity-45 ${active ? activeClass[variant] : "border-line-strong bg-surface font-medium text-sub hover:bg-subtle"} ${className}`}
      {...props}
    />
  );
}
