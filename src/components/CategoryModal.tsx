"use client";

import { useEffect, useState } from "react";

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  transactionId: number | null;
  currentCategoryId: number | null;
  onUpdated: () => void;
}

export default function CategoryModal({
  open,
  onClose,
  transactionId,
  currentCategoryId,
  onUpdated,
}: CategoryModalProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(currentCategoryId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) loadCategories();
    setSelected(currentCategoryId);   // 모달 열릴 때 현재값 반영
  }, [open, currentCategoryId]);

  async function loadCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories);
  }

  const handleSave = async () => {
    if (!selected) return;

    setSaving(true);

    const res = await fetch("/api/update-category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionId,
        categoryId: selected,
      }),
    });

    setSaving(false);

    if (res.ok) {
      onClose();
      onUpdated?.();
    } else {
      alert("카테고리 변경 실패");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white w-80 p-5 rounded shadow">
        <h2 className="text-lg font-bold mb-3">카테고리 수정</h2>

        <select
          className="w-full border p-2 rounded"
          value={selected ?? ""}
          onChange={(e) => setSelected(Number(e.target.value))}
        >
          <option value="">미분류</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            취소
          </button>

          <button
            disabled={saving}
            onClick={handleSave}
            className={`px-4 py-2 rounded text-white 
              ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}
            `}
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}