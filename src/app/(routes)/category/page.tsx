"use client";

import { useEffect, useState } from "react";

import ParentCategorySelector from "@/components/category/ParentCategorySelector";
import ChildCategoryList from "@/components/category/ChildCategoryList";
import DeleteCategoryModal from "@/components/category/DeleteCategoryModal";
// 🔥 자동 분류 기능은 나중에 여기에 import 하면 됨
// import CategoryRuleManager from "./components/CategoryRuleManager";

interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

export default function CategorySettingsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedParent, setSelectedParent] = useState<number | null>(null);

  const [newChildName, setNewChildName] = useState("");

  // 삭제 모달 관련 상태
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

    await fetch("/api/categories", {
      method: "POST",
      body: JSON.stringify({
        name: newChildName,
        parentId: selectedParent,
      }),
    });

    setNewChildName("");
    loadCategories();
  };

  const updateCategoryName = async (id: number, newName: string) => {
    if (!newName.trim()) return;

    await fetch(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name: newName }),
    });

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

  const moveTransactionsToCategory = async (
    oldId: number,
    newId: number | null
  ) => {
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

      {/* 부모 카테고리 */}
      <ParentCategorySelector
        parents={parents}
        selectedParent={selectedParent}
        onSelect={setSelectedParent}
      />

      {/* 자식 카테고리 */}
      <ChildCategoryList
        children={children}
        selectedParent={selectedParent}
        newChildName={newChildName}
        setNewChildName={setNewChildName}
        onAdd={addChildCategory}
        onUpdate={updateCategoryName}
        onDelete={deleteCategory}
      />

      {/* 나중에 자동 분류 규칙 추가 */}
      {/* <CategoryRuleManager /> */}

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
          deleteTarget &&
          moveTransactionsToCategory(deleteTarget.id, null)
        }
      />

    </div>
  );
}
