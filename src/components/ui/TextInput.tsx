import type { InputHTMLAttributes, ReactNode } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  wrapperClassName?: string;
}

export default function TextInput({ icon, wrapperClassName = "", className = "", ...props }: TextInputProps) {
  return (
    <span className={`relative flex items-center ${wrapperClassName}`}>
      {icon && <span aria-hidden="true" className="pointer-events-none absolute left-3 flex text-muted">{icon}</span>}
      <input
        className={`h-11 w-full min-w-0 rounded-lg border border-line-strong bg-input px-3.5 text-[15px] text-ink transition-[border-color,box-shadow] outline-none placeholder:text-muted focus:border-primary focus:ring-[3px] focus:ring-primary/15 focus-visible:outline-none ${icon ? "pl-10" : ""} ${className}`}
        {...props}
      />
    </span>
  );
}
