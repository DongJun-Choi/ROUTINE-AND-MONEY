"use client";

import { useEffect, useRef, useState } from "react";
import Calendar from "@/components/Calendar";

interface Transaction {
  id: number;
  date: string;
  merchant: string;
  amount: number;
  paymentType: string;
}

export default function TransactionsPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const todayKey = new Date().toISOString().slice(0, 10);

  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));

  const [selectedDate, setSelectedDate] = useState<string | null>(todayKey);

  const listRef = useRef<HTMLDivElement>(null);

  async function fetchData() {
    setLoading(true);
    const query = `?year=${year}&month=${month}`;
    const res = await fetch(`/api/transactions${query}`);
    const json = await res.json();
    setData(json.transactions);
    setLoading(false);
  }

  // 날짜별 합계 계산
  const dailyTotals: Record<string, number> = {};
  data.forEach((t) => {
    const key = t.date.slice(0, 10);
    dailyTotals[key] = (dailyTotals[key] ?? 0) + t.amount;
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [year, month]);

  // 날짜 클릭 → 해당 날짜 내역으로 스크롤 이동
  const handleDateSelect = (date: string) => {
        setSelectedDate(date);

        setTimeout(() => {
          const target = document.getElementById(`day-${date}`);
          if (target && listRef.current) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 50);
  };

  return (
    <div className="max-w-5xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">📒 가계부 내역</h1>

      {/* 달력 – 항상 상단에 고정된 느낌 */}
      <Calendar
        year={Number(year)}
        month={Number(month)}
        dailyTotals={dailyTotals}
        selectedDate={selectedDate ?? undefined}
        onSelectDate={handleDateSelect}
      />

      {/* 월별 선택 */}
      <div className="flex gap-2 mb-4 mt-6">
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          {[...Array(12)].map((_, i) => {
            const mm = String(i + 1).padStart(2, "0");
            return (
              <option key={mm} value={mm}>
                {mm}
              </option>
            );
          })}
        </select>

        <button
          onClick={fetchData}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          조회
        </button>
      </div>

      {/* 내역 리스트 - 스크롤 영역 */}
      <div
        ref={listRef}
        className="overflow-y-scroll max-h-[500px] bg-white shadow rounded-lg p-3"
      >
        {loading && <p>불러오는 중...</p>}

        {!loading && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-3">날짜</th>
                <th className="p-3">가맹점</th>
                <th className="p-3 text-right">금액</th>
                <th className="p-3">결제</th>
              </tr>
            </thead>

            <tbody>
              {data.map((t) => {
                const dayId = `day-${t.date.slice(0, 10)}`;
                return (
                  <tr
                    key={t.id}
                    id={dayId}
                    className={`border-b hover:bg-gray-50 ${
                      t.date.slice(0, 10) === selectedDate ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="p-3">{formatDate(t.date)}</td>
                    <td className="p-3">{t.merchant}</td>
                    <td className="p-3 text-right font-bold">
                      {t.amount.toLocaleString()}원
                    </td>
                    <td className="p-3">
                      <PaymentTypeTag type={t.paymentType} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function PaymentTypeTag({ type }: { type: string }) {
  const colors: Record<string, string> = {
    CARD: "bg-blue-100 text-blue-600",
    POINT: "bg-purple-100 text-purple-600",
    MIXED: "bg-orange-100 text-orange-600",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded ${colors[type]}`}>
      {type}
    </span>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ko-KR");
}