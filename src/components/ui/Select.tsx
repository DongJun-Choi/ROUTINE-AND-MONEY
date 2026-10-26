import type { SelectHTMLAttributes } from "react";

export default function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`h-11 w-full min-w-0 cursor-pointer rounded-lg border border-line-strong bg-input px-2.5 text-sm text-ink transition-[border-color,box-shadow] outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 focus-visible:outline-none ${className}`}
      {...props}
    />
  );
}
