import type { ButtonHTMLAttributes } from "react";

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  label: string;
  tone?: "neutral" | "danger";
}

const toneClass = {
  neutral: "text-icon hover:bg-subtle hover:text-heading",
  danger: "text-danger hover:bg-danger-soft",
};

export default function IconButton({ label, tone = "neutral", type = "button", className = "", ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`flex size-11 shrink-0 items-center justify-center rounded-[10px] transition-colors disabled:opacity-45 ${toneClass[tone]} ${className}`}
      {...props}
    />
  );
}
