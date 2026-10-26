"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookText, LayoutDashboard, Tag, Upload, type LucideIcon } from "lucide-react";
import BrandMark from "@/components/BrandMark";

interface NavigationItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

const navigation: NavigationItem[] = [
  { href: "/dashboard", label: "대시보드", shortLabel: "대시보드", icon: LayoutDashboard },
  { href: "/transactions", label: "가계부", shortLabel: "가계부", icon: BookText },
  { href: "/category", label: "카테고리", shortLabel: "카테고리", icon: Tag },
  { href: "/upload", label: "명세서 가져오기", shortLabel: "가져오기", icon: Upload },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col gap-8 border-r border-line bg-surface px-4 py-7 lg:flex">
      <Link href="/dashboard" className="flex items-center gap-3 px-2">
        <BrandMark />
        <span className="flex flex-col gap-0.5">
          <span className="text-lg leading-6 font-bold tracking-[-0.02em] text-heading">루틴&amp;머니</span>
          <span className="text-xs leading-4 text-muted">카드 소비 관리</span>
        </span>
      </Link>
      <nav aria-label="주요 메뉴" className="flex flex-col gap-1">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[46px] items-center gap-3 rounded-[10px] px-3.5 text-[15px] transition-colors ${active ? "bg-primary font-semibold text-on-primary" : "font-medium text-sub hover:bg-subtle hover:text-heading"}`}
            >
              <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function MobileTopBar() {
  return (
    <header className="sticky top-0 z-30 flex min-h-[60px] items-center justify-between gap-3 border-b border-line bg-surface/95 px-4 py-2 backdrop-blur lg:hidden">
      <Link href="/dashboard" className="flex items-center gap-2.5">
        <BrandMark size="sm" />
        <span className="text-base leading-[22px] font-bold tracking-[-0.02em] text-heading">루틴&amp;머니</span>
      </Link>
      <Link href="/upload" aria-label="명세서 가져오기" className="flex size-11 items-center justify-center rounded-[10px] border border-line-control bg-surface text-ink">
        <Upload size={20} strokeWidth={1.8} aria-hidden="true" />
      </Link>
    </header>
  );
}

function BottomTabs({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="주요 메뉴" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 gap-1 border-t border-line bg-surface px-2 pt-1.5 pb-[calc(10px+env(safe-area-inset-bottom))] lg:hidden">
      {navigation.map(({ href, shortLabel, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] leading-[14px] ${active ? "font-semibold text-primary-text" : "font-medium text-icon"}`}
          >
            <span aria-hidden="true" className={`flex h-7 w-14 items-center justify-center rounded-full ${active ? "bg-primary-soft" : ""}`}>
              <Icon size={20} strokeWidth={1.8} />
            </span>
            {shortLabel}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen">
      <Sidebar pathname={pathname} />
      <MobileTopBar />
      <main className="app-content min-w-0 px-4 pt-5 pb-28 lg:ml-[248px] lg:px-10 lg:pt-8 lg:pb-12">
        <div className="mx-auto w-full max-w-[1600px]">{children}</div>
      </main>
      <BottomTabs pathname={pathname} />
    </div>
  );
}
