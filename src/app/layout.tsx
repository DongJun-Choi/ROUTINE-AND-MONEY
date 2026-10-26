import { Inter, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// 한글 글리프는 unicode-range 조각으로 나뉘어 있어 미리 불러오지 않고, 화면에 쓰인 조각만 받는다.
const notoSansKr = Noto_Sans_KR({ subsets: ["latin"], variable: "--font-noto-kr", display: "swap", preload: false });

export const metadata = {
  title: "Routine & Money",
  description: "카드 소비 내역과 패턴을 관리하는 개인 재무 대시보드",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // 테마 초기화 스크립트가 hydration 전에 data-theme을 붙이므로 html 속성 차이 경고는 무시한다.
    <html lang="ko" className={`${inter.variable} ${notoSansKr.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
