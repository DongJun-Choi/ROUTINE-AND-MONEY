import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen bg-gray-50">

        {/* Left Sidebar */}
        <aside className="w-64 bg-white shadow-md px-6 py-8 flex flex-col">
          <h1 className="text-2xl font-bold mb-8">💰 Routine & Money</h1>

          <nav className="flex flex-col gap-4">
            <a href="/upload" className="text-gray-700 hover:text-black">
              📤 엑셀 업로드
            </a>
            <a href="/transactions" className="text-gray-700 hover:text-black">
              📒 가계부 내역
            </a>
          </nav>
        </aside>

        {/* Main page content */}
        <main className="flex-1 p-8">{children}</main>
      </body>
    </html>
  );
}