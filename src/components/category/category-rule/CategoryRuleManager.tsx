"use client";

import { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

export default function CategoryRuleManager() {
  const [rules, setRules] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [keyword, setKeyword] = useState("");

  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);

  // --- Load rules + categories ---
  useEffect(() => {
    loadRules();
    loadCategories();
  }, []);

  const loadRules = async () => {
    const res = await fetch("/api/category-rules");
    const data = await res.json();
    setRules(data);
  };

  const loadCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories);
  };

  // --- Computed categories ---
  const parents = categories.filter((c) => c.parentId === null);
  const children = categories.filter((c) => c.parentId === selectedParent);

  // --- Add rule ---
  const addRule = async () => {
    if (!keyword.trim() || !selectedChild) return;

    await fetch("/api/category-rules/add", {
      method: "POST",
      body: JSON.stringify({
        keyword: keyword.trim().toLowerCase(),
        categoryId: selectedChild,
      }),
    });

    setKeyword("");
    setSelectedParent(null);
    setSelectedChild(null);
    loadRules();
  };

  // --- Delete rule ---
  const deleteRule = async (rule: any) => {
    const msg = `자동 분류 규칙을 삭제하시겠습니까?\n\n"${rule.keyword}" → ${rule.category?.name}`;
    const ok = window.confirm(msg);
    if (!ok) return;

    await fetch(`/api/category-rules/${rule.id}`, {
      method: "DELETE",
    });

    loadRules();
  };

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-lg font-bold mb-3">자동 분류 규칙</h2>

      <p className="text-sm text-gray-500 mb-2">
        💡 입력한 키워드가 포함된 가맹점은 자동으로 선택한 카테고리로 분류됩니다.
      </p>

      {/* 키워드 입력 */}
      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 flex-1"
          placeholder="키워드 (예: 스타벅스)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* --- 카테고리 선택 UI --- */}
      <div className="mb-3">
        <p className="font-semibold mb-2">카테고리 선택</p>

        {/* 부모 카테고리 */}
        <div className="flex flex-wrap gap-2 mb-3">
          {parents.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedParent(p.id);
                setSelectedChild(null);
              }}
              className={`px-3 py-1 rounded-full border text-sm ${
                selectedParent === p.id
                  ? "bg-blue-100 border-blue-600 text-blue-600"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {selectedParent && (
            <div className="my-3 border-t border-gray-300" />
        )}

        {/* 자식 카테고리 */}
        {selectedParent && (
          <div className="flex flex-wrap gap-2">
            {children.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedChild(c.id)}
                className={`px-3 py-1 rounded-full border text-sm ${
                  selectedChild === c.id
                    ? "bg-green-100 border-green-600 text-green-600"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {!selectedParent && (
          <p className="text-xs text-gray-400 mt-1">※ 대분류를 먼저 선택하세요.</p>
        )}
      </div>

      {/* 규칙 추가 버튼 */}
      <button
        onClick={addRule}
        className="bg-black text-white px-4 py-2 rounded mt-3"
        disabled={!selectedChild || !keyword.trim()}
      >
        규칙 추가
      </button>

      <hr className="my-4" />

      {/* 현재 규칙 */}
      <h3 className="font-semibold mb-2">현재 규칙</h3>

      <ul className="space-y-2">
        {rules.map((r) => (
          <li key={r.id} className="flex justify-between text-sm">
            <span>
              <b>{r.keyword}</b> → {r.category?.name}
            </span>
            <button
              className="text-red-500"
              onClick={() => deleteRule(r)}
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
