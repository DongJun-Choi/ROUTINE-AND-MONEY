import type { TextareaHTMLAttributes } from "react";

export default function TextArea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-[88px] w-full resize-y rounded-lg border border-line-strong bg-input px-3.5 py-3 text-sm leading-5 text-ink transition-[border-color,box-shadow] outline-none placeholder:text-muted focus:border-primary focus:ring-[3px] focus:ring-primary/15 focus-visible:outline-none ${className}`}
      {...props}
    />
  );
}
