"use client";

import { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

interface Props {
  categories: Category[];
  selectedCategory: number | null;
  onSelect: (categoryId: number | null) => void;
  resetSignal: number; // ← 초기화 감지
}

export function FilterCategorySelector({
  categories,
  selectedCategory,
  onSelect,
  resetSignal,
}: Props) {
  const parents = categories.filter((c) => c.parentId === null);

  const childrenMap = categories.reduce((acc, c) => {
    if (c.parentId !== null) {
      if (!acc[c.parentId]) acc[c.parentId] = [];
      acc[c.parentId].push(c);
    }
    return acc;
  }, {} as Record<number, Category[]>);

  const [parentSelected, setParentSelected] = useState<number | null>(null);
  const [childSelected, setChildSelected] = useState<number | null>(null);

  // 초기화 감지 → 선택 상태 초기화
  useEffect(() => {
    setParentSelected(null);
    setChildSelected(null);
  }, [resetSignal]);

  // 선택 반영
  useEffect(() => {
    if (childSelected !== null) {
      onSelect(childSelected);
    } else if (parentSelected !== null) {
      onSelect(parentSelected);
    } else {
      onSelect(null);
    }
  }, [parentSelected, childSelected]);

  return (
    <div>
      <div className="text-sm font-medium mb-1">카테고리</div>

      {/* 부모 카테고리 */}
      <div className="flex flex-wrap gap-2 mb-3">
        {parents.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setParentSelected(p.id);
              setChildSelected(null);
            }}
            className={`
              px-3 py-1 rounded-full border text-sm
              ${
                parentSelected === p.id
                  ? "bg-blue-100 border-blue-500 text-blue-600"
                  : "bg-white border-gray-300 text-gray-700"
              }
            `}
          >
            {p.name}
          </button>
        ))}

        {/* 미분류 */}
        <button
          onClick={() => {
            setParentSelected(null);
            setChildSelected(null);
          }}
          className={`
            px-3 py-1 rounded-full border text-sm
            ${
              parentSelected === null && childSelected === null
                ? "bg-blue-100 border-blue-500 text-blue-600"
                : "bg-white border-gray-300 text-gray-700"
            }
          `}
        >
          전체
        </button>
      </div>

      {/* 자식 카테고리 */}
      {parentSelected !== null && (
        <div className="ml-1 pl-3 border-l space-y-1">
          {(childrenMap[parentSelected] ?? []).map((child) => (
            <button
              key={child.id}
              onClick={() => setChildSelected(child.id)}
              className={`
                w-full text-left px-2 py-1 rounded
                ${
                  childSelected === child.id
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }
              `}
            >
              {child.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
