"use client";

import { useState } from "react";
import { FilterCategorySelector } from "@/components/FilterCategorySelector";

interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

interface Props {
  categories: Category[];
  onApply: (filters: {
    categoryId: number | null;
    type: "income" | "expense" | null;
    paymentType: string | null;
  }) => void;
  onReset: () => void;
}

export default function FilterFloatingBox({
  categories,
  onApply,
  onReset,
}: Props) {
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [type, setType] = useState<"income" | "expense" | null>(null);
  const [paymentType, setPaymentType] = useState<string | "">("");

  const [resetSignal, setResetSignal] = useState(0);

  function applyFilter() {
    onApply({
      categoryId,
      type,
      paymentType: paymentType === "" ? null : paymentType,
    });
  }

  function resetFilter() {
    setCategoryId(null);
    setType(null);
    setPaymentType("");
    setResetSignal((p) => p + 1); // ← 자식 컴포넌트 초기화

    onReset();
  }

  return (
    <div className="fixed right-6 top-32 w-64 bg-white rounded-xl shadow-lg border p-4 z-40 hidden lg:block">
      <h2 className="text-lg font-semibold mb-4">🔎 필터</h2>

      {/* 카테고리 */}
      <div className="mb-4">
        <FilterCategorySelector
          categories={categories}
          selectedCategory={categoryId}
          onSelect={setCategoryId}
          resetSignal={resetSignal}
        />
      </div>

      {/* 수입 / 지출 */}
      <div className="mb-4">
        <div className="text-sm font-medium mb-1">유형</div>
        <div className="flex gap-2">
          <button
            onClick={() => setType(type === "income" ? null : "income")}
            className={`flex-1 border rounded-lg px-2 py-1 text-sm ${
              type === "income"
                ? "bg-blue-100 border-blue-500 text-blue-600"
                : "bg-white"
            }`}
          >
            수입
          </button>

          <button
            onClick={() => setType(type === "expense" ? null : "expense")}
            className={`flex-1 border rounded-lg px-2 py-1 text-sm ${
              type === "expense"
                ? "bg-red-100 border-red-500 text-red-600"
                : "bg-white"
            }`}
          >
            지출
          </button>
        </div>
      </div>

      {/* 결제 방식 */}
      <div className="mb-4">
        <div className="text-sm font-medium mb-1">결제 방식</div>
        <select
          className="w-full px-3 py-2 border rounded-lg"
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
        >
          <option value="">전체</option>
          <option value="CARD">카드</option>
          <option value="POINT">포인트</option>
          <option value="MIXED">혼합 결제</option>
        </select>
      </div>

      {/* 버튼 */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={resetFilter}
          className="flex-1 border px-3 py-2 rounded-lg text-sm"
        >
          초기화
        </button>

        <button
          onClick={applyFilter}
          className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm"
        >
          적용
        </button>
      </div>
    </div>
  );
}
