"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FolderTree, Menu, ReceiptText, Upload, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  { href: "/dashboard", label: "대시보드", icon: BarChart3 },
  { href: "/transactions", label: "거래 내역", icon: ReceiptText },
  { href: "/upload", label: "내역 가져오기", icon: Upload },
  { href: "/category", label: "카테고리", icon: FolderTree },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return <><div className="podo-brand"><Link href="/dashboard" className="brand-wordmark" onClick={onNavigate} aria-label="Routine & Money 대시보드로 이동">R&amp;M<span>.</span></Link>{onNavigate && <button className="icon-button mobile-only" onClick={onNavigate} aria-label="메뉴 닫기"><X size={19} /></button>}</div><nav className="podo-nav" aria-label="주요 메뉴">{navigation.map(({ href, label, icon: Icon }) => { const active = pathname === href || pathname.startsWith(`${href}/`); return <Link key={href} href={href} className={active ? "active" : ""} onClick={onNavigate}><Icon size={20} strokeWidth={1.8} /><span>{label}</span></Link>; })}</nav><div className="sidebar-note"><strong>Routine &amp; Money</strong><span>카드 소비를 한눈에 관리하세요</span></div></>;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="app-shell"><aside className="app-sidebar"><Sidebar /></aside><header className="mobile-header"><button className="icon-button" onClick={() => setMenuOpen(true)} aria-label="메뉴 열기"><Menu size={20} /></button><Link href="/dashboard" className="brand-wordmark" aria-label="Routine & Money 대시보드로 이동">R&amp;M<span>.</span></Link></header>{menuOpen && <><button className="drawer-backdrop" onClick={() => setMenuOpen(false)} aria-label="메뉴 닫기" /><aside className="mobile-drawer"><Sidebar onNavigate={() => setMenuOpen(false)} /></aside></>}<main className="app-content">{children}</main></div>;
}
