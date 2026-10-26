import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost";
export type ButtonSize = "md" | "lg";

const variantClass: Record<ButtonVariant, string> = {
  primary: "border-primary bg-primary text-on-primary hover:border-primary-hover hover:bg-primary-hover disabled:border-line disabled:bg-line disabled:text-muted",
  secondary: "border-line-control bg-surface text-ink hover:bg-subtle disabled:text-muted",
  destructive: "border-danger-line bg-danger-soft text-danger hover:brightness-95",
  ghost: "border-transparent bg-transparent text-sub hover:bg-subtle hover:text-heading",
};

const sizeClass: Record<ButtonSize, string> = {
  md: "min-h-11 px-4",
  lg: "min-h-[46px] px-[18px]",
};

export function buttonStyles({ variant = "secondary", size = "md", className = "" }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border text-sm font-semibold transition-colors ${variantClass[variant]} ${sizeClass[size]} ${className}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export default function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonStyles({ variant, size, className })} {...props} />;
}
