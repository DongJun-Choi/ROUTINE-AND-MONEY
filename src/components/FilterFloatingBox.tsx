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
    query: string;
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
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"income" | "expense" | null>(null);
  const [paymentType, setPaymentType] = useState<string | "">("");

  const [resetSignal, setResetSignal] = useState(0);

  function applyFilter() {
    onApply({
      query: query.trim(),
      categoryId,
      type,
      paymentType: paymentType === "" ? null : paymentType,
    });
  }

  function resetFilter() {
    setCategoryId(null);
    setQuery("");
    setType(null);
    setPaymentType("");
    setResetSignal((p) => p + 1); // ← 자식 컴포넌트 초기화

    onReset();
  }

  return (
    <div className="podo-panel mb-5 p-4 lg:fixed lg:right-8 lg:top-8 lg:z-30 lg:mb-0 lg:w-64 lg:shadow-lg">
      <h2 className="text-base font-semibold mb-4">필터</h2>

      <label className="mb-4 block">
        <span className="mb-1 block text-sm font-medium">내역 검색</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") applyFilter(); }}
          placeholder="가맹점 또는 메모"
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </label>

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
