"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Calendar from "@/components/Calendar";
import CategoryTag from "@/components/CategoryTag";
import TransactionDetailModal from "@/components/TransactionDetailModal";
import FilterFloatingBox from "@/components/FilterFloatingBox";

type PaymentType = "CARD" | "POINT" | "MIXED";

interface Transaction {
  id: number;
  date: string;
  merchant: string;
  amount: number;
  paymentType: PaymentType;
  type: "INCOME" | "EXPENSE";
  categoryId: number | null;
  memo?: string | null;
  category?: {
    id: number;
    name: string;
    parentId: number | null;
    parent?: { id: number; name: string } | null;
  } | null;
}

interface Category {
  id: number;
  name: string;
  parentId: number | null;
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const [filters, setFilters] = useState({
    categoryId: null as number | null,
    type: null as "income" | "expense" | null,
    paymentType: null as string | null,
  });

  const [categories, setCategories] = useState<Category[]>([]);

  async function fetchData() {
    setLoading(true);
    const res = await fetch(`/api/transactions?year=${year}&month=${month}`);
    const json = await res.json();
    setData(json.transactions);
    setLoading(false);
  }


  // categories 미리 로드
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((d) => setCategories(d.categories));
  }, []);

  const childrenMap = useMemo(() => {
    return categories.reduce((acc, c) => {
      if (c.parentId !== null) {
        if (!acc[c.parentId]) acc[c.parentId] = [];
        acc[c.parentId].push(c.id);
      }
      return acc;
    }, {} as Record<number, number[]>);
  }, [categories]);

  function getCategoryIdsForFilter(parentId: number): number[] {
    const childIds = childrenMap[parentId] ?? [];
    return [parentId, ...childIds];
  }

  const filteredData = useMemo(() => {
    return data.filter((t) => {
      if (filters.categoryId !== null) {
        const ids = getCategoryIdsForFilter(filters.categoryId);
        if (!ids.includes(t.categoryId ?? -1)) return false;
      }

      if (filters.type === "income" && t.type !== "INCOME") return false;
      if (filters.type === "expense" && t.type !== "EXPENSE") return false;

      if (filters.paymentType && t.paymentType !== filters.paymentType) return false;

      return true;
    });
  }, [data, filters, childrenMap]);

  // 날짜별 그룹핑
  const groupedByDate = filteredData.reduce((acc: Record<string, Transaction[]>, t) => {
    const key = t.date.slice(0, 10);
    acc[key] = acc[key] || [];
    acc[key].push(t);
    return acc;
  }, {});

  // 날짜별 income/expense 계산
  const dailyTotals: Record<string, { income: number; expense: number }> = {};
  filteredData.forEach((t) => {
    const key = t.date.slice(0, 10);

    if (!dailyTotals[key]) dailyTotals[key] = { income: 0, expense: 0 };

    if (t.type === "EXPENSE") {
      dailyTotals[key].expense += t.amount;
    } else {
      dailyTotals[key].income += t.amount;
    }
  });

  // 월 통계
  const monthlySummary = filteredData.reduce(
    (acc, t) => {
      if (t.type === "EXPENSE") acc.expense += t.amount;
      else acc.income += t.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );
  const total = monthlySummary.income - monthlySummary.expense;

  // 날짜 이동
  function goToday() {
    const today = new Date();
    setYear(String(today.getFullYear()));
    setMonth(String(today.getMonth() + 1).padStart(2, "0"));
    setSelectedDate(today.toISOString().slice(0, 10));
  }
  function goPrevMonth() {
    let y = Number(year), m = Number(month);
    if (m === 1) { y -= 1; m = 12; }
    else m -= 1;
    setYear(String(y));
    setMonth(String(m).padStart(2, "0"));
  }
  function goNextMonth() {
    let y = Number(year), m = Number(month);
    if (y === currentYear && m === 12) {
      return;
    }
    if (m === 12) { y += 1; m = 1; }
    else m += 1;
    setYear(String(y));
    setMonth(String(m).padStart(2, "0"));
  }

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchData(); }, [year, month]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setTimeout(() => {
      const el = document.getElementById(`day-${date}`);
      if (el && listRef.current) el.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };


  return (
    <>
    <FilterFloatingBox
      categories={categories}
      onApply={(newFilters) => setFilters(newFilters)}
      onReset={() =>
        setFilters({
          categoryId: null,
          type: null,
          paymentType: null,
        })
      }
    />
    <div className="page-container pb-20 lg:pr-72">

      {/* 헤더 */}
      <div className="page-heading"><h1>거래 내역</h1><p>날짜별 카드 이용 내역과 수입·지출을 확인하세요.</p></div>

      {/* 월 이동 */}
      <div className="flex items-center justify-between mb-4 mt-4">
        <button onClick={goPrevMonth} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200">◀</button>

        <h2 className="text-base font-semibold">
          {year}년 {month}월
        </h2>

        <div className="flex items-center gap-2">
          <button onClick={goNextMonth} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200">▶</button>
          <button onClick={goToday} className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">⟳</button>
        </div>
      </div>

      {/* 캘린더 */}
      <Calendar
        year={Number(year)}
        month={Number(month)}
        dailyTotals={dailyTotals}
        selectedDate={selectedDate ?? undefined}
        onSelectDate={handleDateSelect}
      />

      {/* 월 요약 */}
      <div className="podo-panel mt-6 mb-8 p-5">
        <div className="text-base font-semibold mb-2">이번 달 요약</div>

        <div className="flex flex-col gap-1 text-sm">
          <span className="text-red-600 font-semibold">
            지출: -{Math.abs(monthlySummary.expense).toLocaleString()}원
          </span>
          <span className="text-blue-600 font-semibold">
            수입: +{monthlySummary.income.toLocaleString()}원
          </span>

          <span
            className={`mt-2 font-bold ${
              total < 0 ? "text-red-600" : "text-blue-600"
            }`}
          >
            합계: {total < 0 ? "-" : "+"}
            {Math.abs(total).toLocaleString()}원
          </span>
        </div>
      </div>

      {/* 년/월 선택 + 추가 */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-3">
          <select
            className="border px-3 py-2 rounded-lg bg-white shadow-sm"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select className="border px-3 py-2 rounded-lg bg-white shadow-sm" value={month} onChange={(e) => setMonth(e.target.value)}>
            {[...Array(12)].map((_, i) => {
              const mm = String(i + 1).padStart(2, "0");
              return <option key={mm}>{mm}</option>;
            })}
          </select>

          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-600">
            조회
          </button>
        </div>

        <button
          onClick={() => {
            setSelectedTx(null);
            setDetailOpen(true);
          }}
          className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-green-600"
        >
          + 내역 추가
        </button>
      </div>

      {/* 리스트 */}
      <div ref={listRef} className="overflow-y-scroll max-h-[520px] space-y-6 pr-1">
        {loading && <p>불러오는 중...</p>}

        {!loading &&
          Object.entries(groupedByDate)
            .sort(([a], [b]) => (a < b ? 1 : -1))
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
                      className="podo-panel cursor-pointer p-4 transition hover:border-[#bdb7cb] hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-gray-900 font-medium">{t.merchant}</div>
                          <div className="mt-1">
                            <CategoryTag name={t.category?.name ?? null} parentName={t.category?.parent?.name ?? null} />
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`font-bold text-lg ${t.type === "EXPENSE" ? "text-red-600" : "text-blue-600"}`}>
                            {t.type === "EXPENSE" ? "-" : "+"}
                            {t.amount.toLocaleString()}원
                          </div>
                          <PaymentTypeTag paymentType={t.paymentType} />
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
    </>
  );
}

function PaymentTypeTag({ paymentType }: { paymentType: PaymentType }) {
  const colors = {
    CARD: "bg-blue-100 text-blue-600",
    POINT: "bg-purple-100 text-purple-600",
    MIXED: "bg-orange-100 text-orange-600",
  };
  return <span className={`text-xs px-2 py-1 rounded-full ${colors[paymentType]}`}>{paymentType}</span>;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}
