"use client";

import { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

interface TransactionDetail {
  id: number;
  date: string; // ISO string
  merchant: string;
  amount: number;
  paymentType: "CARD" | "POINT" | "MIXED";
  memo?: string | null;
  categoryId: number | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  transaction: TransactionDetail | null;
  onSaved: () => void;
  onDeleted: () => void;
}

const paymentTypeLabels: Record<string, string> = {
  CARD: "카드 결제",
  POINT: "포인트",
  MIXED: "혼합 결제",
};

export default function TransactionDetailModal({
  open,
  onClose,
  transaction,
  onSaved,
  onDeleted,
}: Props) {
  const [merchant, setMerchant] = useState("");
  const [date, setDate] = useState(""); // "YYYY-MM-DD"
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] =
    useState<"CARD" | "POINT" | "MIXED">("CARD");
  const [memo, setMemo] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [parentSelected, setParentSelected] = useState<number | null>(null);
  const [childSelected, setChildSelected] = useState<number | null>(null);

  useEffect(() => {
  if (open && transaction && categories.length > 0) {
    if (transaction.categoryId) {
      const c = categories.find(cat => cat.id === transaction.categoryId);
      setChildSelected(c?.id ?? null);
      setParentSelected(c?.parentId ?? c?.id ?? null);
    } else {
      setChildSelected(null);
      setParentSelected(null);
    }
  }
}, [open, transaction, categories]);

  const parents = categories.filter(c => c.parentId === null);
  const childrenMap = categories.reduce((acc, c) => {
    if (c.parentId) {
      if (!acc[c.parentId]) acc[c.parentId] = [];
      acc[c.parentId].push(c);
    }
    return acc;
  }, {} as Record<number, Category[]>);

  // 모달 열릴 때 현재 거래 정보로 초기화
  useEffect(() => {
    if (open && transaction) {
      setMerchant(transaction.merchant);
      setAmount(String(transaction.amount));
      setPaymentType(transaction.paymentType);
      setMemo(transaction.memo ?? "");
      setCategoryId(transaction.categoryId ?? "");
      // ISO → "YYYY-MM-DD"
      const d = new Date(transaction.date);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      setDate(`${yyyy}-${mm}-${dd}`);
      loadCategories();
    }
  }, [open, transaction]);

  async function loadCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories);
  }

  if (!open || !transaction) return null;

  const handleSave = async () => {
    if (!date || !merchant || !amount) {
      alert("날짜, 가맹점, 금액은 필수입니다.");
      return;
    }

    const finalCategoryId =
    childSelected !== null
      ? childSelected
      : parentSelected !== null
      ? parentSelected
      : null;

    setSaving(true);
    const res = await fetch(`/api/transactions/${transaction.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        merchant,
        amount: Number(amount),
        paymentType,
        categoryId: finalCategoryId,
        memo,
      }),
    });
    setSaving(false);

    if (res.ok) {
      onSaved();
      onClose();
    } else {
      alert("저장에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 이 거래 내역을 삭제할까요?")) return;

    setDeleting(true);
    const res = await fetch(`/api/transactions/${transaction.id}`, {
      method: "DELETE",
    });
    setDeleting(false);

    if (res.ok) {
      onDeleted();
      onClose();
    } else {
      alert("삭제에 실패했습니다.");
    }
  };

  const formattedAmount =
    amount === "" ? "" : Number(amount).toLocaleString() + "원";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-5">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">거래 상세</h2>
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* 상단 요약 영역 */}
        <div className="mb-4 rounded-xl bg-gray-50 p-3">
          <div className="text-sm text-gray-500 mb-1">가맹점</div>
          <input
            className="w-full bg-transparent text-base font-semibold outline-none"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />

          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">날짜</div>
              <input
                type="date"
                className="text-sm bg-white border rounded px-2 py-1"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">금액</div>
              <input
                className="w-32 text-right bg-white border rounded px-2 py-1 text-sm"
                value={amount}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  setAmount(v);
                }}
              />
              <div className="text-[11px] text-gray-400 mt-0.5">
                {formattedAmount}
              </div>
            </div>
          </div>
        </div>

        {/* 결제 수단 */}
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">결제 방식</div>
          <div className="flex gap-2">
            {(["CARD", "POINT", "MIXED"] as const).map((pt) => (
              <button
                key={pt}
                type="button"
                onClick={() => setPaymentType(pt)}
                className={`flex-1 rounded-full border px-2 py-1 text-xs ${
                  paymentType === pt
                    ? "bg-blue-50 border-blue-500 text-blue-600"
                    : "bg-white border-gray-300 text-gray-600"
                }`}
              >
                {paymentTypeLabels[pt]}
              </button>
            ))}
          </div>
        </div>

        {/* 카테고리 */}
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">카테고리</div>

          {/* 1단: 부모 카테고리 */}
          <div className="flex flex-wrap gap-2 mb-3">
            {parents.map(parent => (
              <button
                key={parent.id}
                onClick={() => {
                  setParentSelected(parent.id);
                  setChildSelected(null);
                }}
                className={`
                  px-3 py-1 rounded-full border text-sm
                  ${parentSelected === parent.id
                    ? "bg-blue-100 border-blue-500 text-blue-600"
                    : "bg-white border-gray-300 text-gray-700"}
                `}
              >
                {parent.name}
              </button>
            ))}
            <button
              onClick={() => {
                setParentSelected(null);
                setChildSelected(null);
              }}
              className={`
                px-3 py-1 rounded-full border text-sm
                ${parentSelected === null && childSelected === null
                  ? "bg-blue-100 border-blue-500 text-blue-600"
                  : "bg-white border-gray-300 text-gray-700"
                }
              `}
            >
              미분류
            </button>
          </div>

          {/* 2단: 자식 카테고리 (부모 선택 시에만 표시) */}
          {parentSelected !== null && (
            <div className="ml-1 mt-2 pl-3 border-l space-y-1">
              {(childrenMap[parentSelected] ?? []).map(child => (
                <button
                  key={child.id}
                  onClick={() => setChildSelected(child.id)}
                  className={`
                    w-full text-left px-2 py-1 rounded
                    ${childSelected === child.id
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"}
                  `}
                >
                  {child.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 메모 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">메모</span>
            <span className="text-[11px] text-gray-400">
              {memo.length} / 100
            </span>
          </div>
          <textarea
            maxLength={100}
            className="w-full border rounded px-2 py-2 text-sm resize-none h-20"
            placeholder="이 지출에 대해 메모를 남겨보세요."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>

        {/* 하단 버튼 */}
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className={`text-sm ${
              deleting ? "text-gray-400" : "text-red-500 hover:text-red-600"
            }`}
          >
            {deleting ? "삭제 중..." : "삭제"}
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded-lg border text-sm text-gray-600 bg-white"
            >
              취소
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className={`px-4 py-1 rounded-lg text-sm text-white ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}