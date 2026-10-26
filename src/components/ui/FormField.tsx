import type { ReactNode } from "react";

interface FormFieldProps {
  label: ReactNode;
  htmlFor?: string;
  aside?: ReactNode;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}

export default function FormField({ label, htmlFor, aside, hint, className = "", children }: FormFieldProps) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={htmlFor} className="text-[13px] leading-[18px] font-semibold text-sub">{label}</label>
        {aside}
      </div>
      {children}
      {hint && <p className="m-0 text-xs leading-[18px] text-muted">{hint}</p>}
    </div>
  );
}
