"use client";

import ChildCategoryItem from "./ChildCategoryItem";


export default function ChildCategoryList({
  children,
  selectedParent,
  newChildName,
  setNewChildName,
  onAdd,
  onUpdate,
  onDelete,
}: any) {
  if (!selectedParent)
    return (
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-bold mb-3">자식 카테고리 (중분류)</h2>
        <div className="text-gray-500">
          위에서 부모 카테고리를 선택하면 하위 분류를 관리할 수 있습니다.
        </div>
      </div>
    );

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-lg font-bold mb-3">자식 카테고리 (중분류)</h2>

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 flex-1"
          placeholder="새 중분류 이름"
          value={newChildName}
          onChange={(e) => setNewChildName(e.target.value)}
        />
        <button className="bg-black text-white rounded px-3" onClick={onAdd}>
          추가
        </button>
      </div>

      <ul className="space-y-2">
        {children.map((cat: any) => (
          <ChildCategoryItem
            key={cat.id}
            category={cat}
            onUpdate={onUpdate}
            onDelete={() => onDelete(cat)}
          />
        ))}
      </ul>
    </div>
  );
}
