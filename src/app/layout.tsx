import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Routine & Money",
  description: "카드 소비 내역과 패턴을 관리하는 개인 재무 대시보드",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
