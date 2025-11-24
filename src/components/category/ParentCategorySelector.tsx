"use client";

export default function ParentCategorySelector({
  parents,
  selectedParent,
  onSelect,
}: {
  parents: Category[];
  selectedParent: number | null;
  onSelect: (id: number | null) => void;
}) {
  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-lg font-bold mb-3">부모 카테고리 (대분류)</h2>

      <div className="flex flex-wrap gap-2">
        {parents.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`px-3 py-1 rounded-full border text-sm ${
              selectedParent === p.id
                ? "bg-blue-100 border-blue-600 text-blue-600"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {p.name}
          </button>
        ))}

        <button
          onClick={() => onSelect(null)}
          className={`px-3 py-1 rounded-full border text-sm ${
            selectedParent === null
              ? "bg-blue-100 border-blue-600 text-blue-600"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          전체
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        ※ 대분류는 추가/수정/삭제가 불가능합니다.
      </p>
    </div>
  );
}
