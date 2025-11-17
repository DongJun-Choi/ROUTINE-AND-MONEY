"use client";

import { useEffect, useRef, useState } from "react";
import Calendar from "@/components/Calendar";
import CategoryTag from "@/components/CategoryTag";
import TransactionDetailModal from "@/components/TransactionDetailModal";

interface Transaction {
  id: number;
  date: string;
  merchant: string;
  amount: number;
  paymentType: string;
  categoryId: number | null;
  category?: {
    id: number;
    name: string;
    parentId: number | null;
    parent?: { id: number; name: string } | null;
  } | null;
}

export default function TransactionsPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  const [year, setYear] = useState(String(today.getFullYear()));
  const [month, setMonth] = useState(String(today.getMonth() + 1).padStart(2, "0"));

  const [selectedDate, setSelectedDate] = useState<string | null>(todayKey);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const listRef = useRef<HTMLDivElement>(null);

  async function fetchData() {
    setLoading(true);
    const res = await fetch(`/api/transactions?year=${year}&month=${month}`);
    const json = await res.json();
    setData(json.transactions);
    setLoading(false);
  }

  // 날짜별 그룹핑
  const groupedByDate = data.reduce((acc: Record<string, Transaction[]>, t) => {
    const key = t.date.slice(0, 10);
    acc[key] = acc[key] || [];
    acc[key].push(t);
    return acc;
  }, {});

  const dailyTotals: Record<string, { income: number; expense: number }> = {};

  data.forEach((t) => {
    const key = t.date.slice(0, 10);

    if (!dailyTotals[key]) {
      dailyTotals[key] = { income: 0, expense: 0 };
    }

    if (t.amount < 0) {
      dailyTotals[key].expense += t.amount;
    } else {
      dailyTotals[key].income += t.amount;
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [year, month]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setTimeout(() => {
      const el = document.getElementById(`day-${date}`);
      if (el && listRef.current) el.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-20">
      <h1 className="text-2xl font-bold mb-4">📒 가계부</h1>

      <Calendar
        year={Number(year)}
        month={Number(month)}
        dailyTotals={dailyTotals}
        selectedDate={selectedDate ?? undefined}
        onSelectDate={handleDateSelect}
      />

      {/* 월별 선택 */}
      <div className="flex items-center justify-between mb-6 mt-6">
        {/* 왼쪽: 연/월/조회 버튼 */}
        <div className="flex gap-3">
          <select className="border px-3 py-2 rounded-lg" value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>

          <select className="border px-3 py-2 rounded-lg" value={month} onChange={(e) => setMonth(e.target.value)}>
            {[...Array(12)].map((_, i) => {
              const mm = String(i + 1).padStart(2, "0");
              return <option key={mm}>{mm}</option>;
            })}
          </select>

          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg" onClick={fetchData}>
            조회
          </button>
        </div>

        {/* 오른쪽: 추가 버튼 */}
        <button
          onClick={() => {
            setSelectedTx(null);
            setDetailOpen(true);
          }}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          + 내역 추가
        </button>
      </div>

      {/* 리스트 */}
      <div ref={listRef} className="overflow-y-scroll max-h-[520px] space-y-6 pr-1">
        {loading && <p>불러오는 중...</p>}

        {!loading &&
          Object.entries(groupedByDate)
            .sort(([a], [b]) => (a < b ? 1 : -1)) // 최신 날짜 위로
            .map(([date, items]) => (
              <div key={date} id={`day-${date}`}>
                <div className="text-gray-500 font-semibold mb-2">{formatDate(date)}</div>

                <div className="space-y-3">
                  {items.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTx(t);
                        setDetailOpen(true);
                      }}
                      className="cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-md p-4 border transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-gray-900 font-medium">{t.merchant}</div>
                          <div className="mt-1">
                            <CategoryTag name={t.category?.name ?? null} parentName={t.category?.parent?.name ?? null} />
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-lg">{t.amount.toLocaleString()}원</div>
                          <PaymentTypeTag type={t.paymentType} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
      </div>

      <TransactionDetailModal
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedTx(null);
        }}
        transaction={selectedTx}
        onSaved={fetchData}
        onDeleted={fetchData}
      />
    </div>
  );
}

function PaymentTypeTag({ type }: { type: string }) {
  const colors = {
    CARD: "bg-blue-100 text-blue-600",
    POINT: "bg-purple-100 text-purple-600",
    MIXED: "bg-orange-100 text-orange-600",
  };
  return <span className={`text-xs px-2 py-1 rounded-full ${colors[type]}`}>{type}</span>;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
}