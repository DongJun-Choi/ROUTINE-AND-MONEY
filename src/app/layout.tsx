import { Inter, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// 한글 글리프는 unicode-range 조각으로 나뉘어 있어 미리 불러오지 않고, 화면에 쓰인 조각만 받는다.
const notoSansKr = Noto_Sans_KR({ subsets: ["latin"], variable: "--font-noto-kr", display: "swap", preload: false });

export const metadata = {
  title: "Routine & Money",
  description: "카드 소비 내역과 패턴을 관리하는 개인 재무 대시보드",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKr.variable}`}>
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
