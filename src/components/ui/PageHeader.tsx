import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1 lg:gap-1.5">
        <h1 className="m-0 text-2xl leading-8 font-bold tracking-[-0.02em] text-heading lg:text-[28px] lg:leading-9 lg:tracking-[-0.025em]">{title}</h1>
        {description && <p className="m-0 text-[13px] leading-[18px] text-muted lg:text-sm lg:leading-5">{description}</p>}
      </div>
      {actions && <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">{actions}</div>}
    </header>
  );
}
