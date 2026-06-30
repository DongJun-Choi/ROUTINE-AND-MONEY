interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

export default function DeleteCategoryModal({
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
