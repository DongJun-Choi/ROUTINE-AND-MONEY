"use client";

import { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

export default function CategorySettingsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedParent, setSelectedParent] = useState<number | null>(null);

  const [newChildName, setNewChildName] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [usedCount, setUsedCount] = useState(0);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories); 
  };

  const parents = categories.filter((c) => c.parentId === null);
  const children = categories.filter((c) => c.parentId === selectedParent);

  const addChildCategory = async () => {
    if (!newChildName.trim() || selectedParent === null) return;

    const res = await fetch("/api/categories", {
      method: "POST",
      body: JSON.stringify({
        name: newChildName,
        parentId: selectedParent,
      }),
    });

    const data = await res.json();
    setNewChildName("");
    loadCategories();
  };

  const updateCategoryName = async (id: number, newName: string) => {
    if (!newName.trim()) return;

    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name: newName }),
    });

    const data = await res.json();
    loadCategories();
  };

  const deleteCategory = async (category: Category) => {
    const ok = window.confirm(
      `"${category.name}" 카테고리를 삭제하시겠습니까?`
    );
    if (!ok) return;

    const res = await fetch(`/api/categories/${category.id}`, {
      method: "DELETE",
    });

    const result = await res.json();

    if (result.used) {
      setDeleteTarget(category);
      setUsedCount(result.usedCount);
      setShowDeleteModal(true);
      return;
    }

    loadCategories();
  };

  const moveTransactionsToCategory = async (oldId: number, newId: number | null) => {
    const moveRes = await fetch(`/api/transactions/move-category`, {
      method: "POST",
      body: JSON.stringify({ oldId, newId }),
    });

    if (!moveRes.ok) {
      alert("카테고리 이동 중 오류가 발생했습니다.");
      return;
    }
    await deleteCategoryDirect(oldId);

    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const deleteCategoryDirect = async (id: number) => {
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    loadCategories();
  };

  return (
    <div className="p-6 space-y-8">

      {/* 부모 카테고리 (대분류) */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-bold mb-3">부모 카테고리 (대분류)</h2>

        <div className="flex flex-wrap gap-2">
          {parents.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedParent(p.id)}
              className={`
                px-3 py-1 rounded-full border text-sm
                ${
                  selectedParent === p.id
                    ? "bg-blue-100 border-blue-600 text-blue-600"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              {p.name}
            </button>
          ))}

          <button
            onClick={() => setSelectedParent(null)}
            className={`
              px-3 py-1 rounded-full border text-sm
              ${
                selectedParent === null
                  ? "bg-blue-100 border-blue-600 text-blue-600"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            전체
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          ※ 대분류는 추가/수정/삭제가 불가능합니다.
        </p>
      </div>

      {/* 자식 카테고리 */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-bold mb-3">자식 카테고리 (중분류)</h2>

        {selectedParent ? (
          <>
            {/* 추가 */}
            <div className="flex gap-2 mb-4">
              <input
                className="border p-2 flex-1"
                placeholder="새 중분류 이름"
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
              />
              <button
                className="bg-black text-white rounded px-3"
                onClick={addChildCategory}
              >
                추가
              </button>
            </div>

            {/* 목록 */}
            <ul className="space-y-2">
              {children.map((cat) => (
                <ChildCategoryItem
                  key={cat.id}
                  category={cat}
                  onUpdate={updateCategoryName}
                  onDelete={() => deleteCategory(cat)}
                />
              ))}
            </ul>
          </>
        ) : (
          <div className="text-gray-500">
            위에서 부모 카테고리를 선택하면 하위 분류를 관리할 수 있습니다.
          </div>
        )}
      </div>

      {/* 삭제 모달 */}
      <DeleteCategoryModal
        open={showDeleteModal}
        category={deleteTarget}
        usedCount={usedCount}
        categories={categories}
        onClose={() => setShowDeleteModal(false)}
        onMove={(newId: number) =>
          deleteTarget && moveTransactionsToCategory(deleteTarget.id, newId)
        }
        onMoveToNone={() =>
          deleteTarget && moveTransactionsToCategory(deleteTarget.id, null)
        }
      />
    </div>
  );
}

function ChildCategoryItem({
  category,
  onUpdate,
  onDelete,
}: {
  category: Category;
  onUpdate: (id: number, newName: string) => void;
  onDelete: () => void;
}) {
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState(category.name);

  return (
    <li className="flex justify-between items-center p-2 rounded hover:bg-gray-100">
      {edit ? (
        <input
          className="border p-1 flex-1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : (
        <span>{category.name}</span>
      )}

      <div className="flex gap-2 ml-3 text-sm">
        {edit ? (
          <>
            <button
              className="text-blue-500"
              onClick={() => {
                onUpdate(category.id, value);
                setEdit(false);
              }}
            >
              저장
            </button>
            <button className="text-gray-500" onClick={() => setEdit(false)}>
              취소
            </button>
          </>
        ) : (
          <>
            <button className="text-blue-500" onClick={() => setEdit(true)}>
              수정
            </button>
            <button className="text-red-500" onClick={onDelete}>
              삭제
            </button>
          </>
        )}
      </div>
    </li>
  );
}

/* ---------------- Delete Modal ------------------- */
function DeleteCategoryModal({
  open,
  category,
  usedCount,
  categories,
  onClose,
  onMove,
  onMoveToNone,
}: any) {
  if (!open || !category) return null;

const otherCategories = categories.filter(
  (c: Category) => c.parentId === category.parentId && c.id !== category.id
);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="font-bold text-lg mb-3">카테고리 삭제</h2>

        <p className="text-sm mb-4">
          <b>{category.name}</b> 카테고리는 현재 <b>{usedCount}</b>개의 거래에서 사용 중입니다.
        </p>

        <p className="font-medium mb-2">변경할 카테고리를 선택하세요</p>

        <select
          className="border p-2 w-full mb-3"
          onChange={(e) => {
            const id = Number(e.target.value);
            if (!id) return;
            onMove(id);
          }}
        >
          <option value="">다른 카테고리로 변경</option>
          {otherCategories.map((c: Category) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          className="bg-gray-800 text-white w-full py-2 rounded mb-3"
          onClick={onMoveToNone}
        >
          미분류로 변경
        </button>

        <button
          className="w-full text-center text-gray-500 text-sm"
          onClick={onClose}
        >
          취소
        </button>
      </div>
    </div>
  );
}
