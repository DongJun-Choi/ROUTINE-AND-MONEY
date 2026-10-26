import type { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  badge?: ReactNode;
  value: ReactNode;
  caption?: ReactNode;
  emphasis?: boolean;
  className?: string;
  children?: ReactNode;
}

export default function KpiCard({ title, badge, value, caption, emphasis = false, className = "", children }: KpiCardProps) {
  return (
    <section className={`flex min-w-0 flex-col gap-3 rounded-2xl border p-5 sm:p-6 ${emphasis ? "border-primary bg-primary text-on-primary" : "border-line bg-surface text-heading shadow-card"} ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className={`m-0 text-sm leading-5 font-semibold ${emphasis ? "text-on-primary-sub" : "text-muted"}`}>{title}</h2>
        {badge}
      </div>
      <p className="m-0 text-[26px] leading-8 font-bold tracking-[-0.025em] whitespace-nowrap lg:text-3xl lg:leading-9">{value}</p>
      {caption && <p className={`m-0 text-[13px] leading-[18px] ${emphasis ? "text-on-primary-sub" : "text-muted"}`}>{caption}</p>}
      {children}
    </section>
  );
}
