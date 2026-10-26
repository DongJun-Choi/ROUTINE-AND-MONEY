import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "section" | "div" | "article";
}

export function Card({ as: Tag = "section", className = "", ...props }: CardProps) {
  return <Tag className={`flex min-w-0 flex-col rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6 ${className}`} {...props} />;
}

interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  titleId?: string;
}

export function CardHeader({ title, description, action, titleId }: CardHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <h2 id={titleId} className="m-0 text-lg leading-[26px] font-semibold tracking-[-0.01em] text-heading">{title}</h2>
        {description && <p className="m-0 text-[13px] leading-[18px] text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
