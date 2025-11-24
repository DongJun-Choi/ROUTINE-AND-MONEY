"use client";

import { useState } from "react";

interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

export default function ChildCategoryItem({
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
