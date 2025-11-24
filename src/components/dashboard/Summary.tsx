"use client";

import { useEffect, useState } from "react";

export default function Summary({ year, month }: { year: number; month: number }) {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/dashboard/summary?year=${year}&month=${month}`)
      .then((res) => res.json())
      .then((d) => setSummary(d));
  }, [year, month]);

  if (!summary) return <p>로딩 중...</p>;

  return (
    <div className="text-sm space-y-1">
      <p>지출: <span className="text-red-600 font-semibold">-{summary.expense.toLocaleString()}원</span></p>
      <p>수입: <span className="text-blue-600 font-semibold">+{summary.income.toLocaleString()}원</span></p>

      <p>
        순수익:{" "}
        <span className={summary.net < 0 ? "text-red-600" : "text-blue-600"}>
          {summary.net < 0 ? "-" : "+"}
          {Math.abs(summary.net).toLocaleString()}원
        </span>
      </p>

      <p>거래 건수: <strong>{summary.count}건</strong></p>

      <p>
        가장 많이 사용한 카테고리:{" "}
        <strong>{summary.topCategory.name}</strong>(
        {summary.topCategory.amount.toLocaleString()}원)
      </p>
    </div>
  );
}
