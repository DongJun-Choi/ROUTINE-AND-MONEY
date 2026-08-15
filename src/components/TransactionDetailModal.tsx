"use client";

import { useEffect, useState } from "react";
import CategorySplitModal, { SplitDraft } from "@/components/CategorySplitModal";
import NWaySplitModal from "@/components/NWaySplitModal";
import { Split, Users } from "lucide-react";

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
  type: "INCOME" | "EXPENSE";
  splits?: Array<{ amount: number; categoryId: number | null; label?: string | null }>;
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
  MIX합결제: "혼합 결제",
};

export default function TransactionDetailModal({
  open,
  onClose,
  transaction,
  onSaved,
  onDeleted,
}: Props) {
  const [merchant, setMerchant] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] =
    useState<"CARD" | "POINT" | "MIXED">("CARD");
  const [transactionType, setTransactionType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [memo, setMemo] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [nWayOpen, setNWayOpen] = useState(false);
  const [categorySplitOpen, setCategorySplitOpen] = useState(false);
  const [splits, setSplits] = useState<SplitDraft[]>([]);
  const [createRule, setCreateRule] = useState(false);
  const [ruleKeyword, setRuleKeyword] = useState("");

  const [parentSelected, setParentSelected] = useState<number | null>(null);
  const [childSelected, setChildSelected] = useState<number | null>(null);

  /** 전체 카테고리 로딩 */
  async function loadCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories);
    return data.categories as Category[];
  }

  /** 부모/자식 카테고리 분류 */
  const parents = categories.filter(c => c.parentId === null);
  const childrenMap = categories.reduce((acc, c) => {
    if (c.parentId) {
      if (!acc[c.parentId]) acc[c.parentId] = [];
      acc[c.parentId].push(c);
    }
    return acc;
  }, {} as Record<number, Category[]>);

  /** 모달 open 시 초기화 */
  useEffect(() => {
    if (!open) return;

    void loadCategories().then((loadedCategories) => {
      if (!transaction) return;
      const selected = loadedCategories.find((category) => category.id === transaction.categoryId);
      setChildSelected(selected?.parentId ? selected.id : null);
      setParentSelected(selected?.parentId ?? selected?.id ?? null);
    });

    if (transaction) {
      setMerchant(transaction.merchant);
      setRuleKeyword(transaction.merchant);
      setCreateRule(false);
      setSplits((transaction.splits ?? []).map((split) => ({ amount: split.amount, categoryId: split.categoryId, label: split.label ?? "" })));
      setAmount(String(transaction.amount));
      setTransactionType(transaction.type);
      setPaymentType(transaction.paymentType);
      setMemo(transaction.memo ?? "");

      const d = new Date(transaction.date);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      setDate(`${yyyy}-${mm}-${dd}`);

      setCategoryId(transaction.categoryId ?? "");

    } else {
      // 추가 모드: 초기값
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");

      setMerchant("");
      setRuleKeyword("");
      setCreateRule(false);
      setSplits([]);
      setAmount("");
      setPaymentType("CARD");
      setTransactionType("EXPENSE");
      setMemo("");
      setCategoryId("");
      setDate(`${yyyy}-${mm}-${dd}`);

      setParentSelected(null);
      setChildSelected(null);
    }
  }, [open, transaction]);

  /** 저장 (POST | PUT) */
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

    const payload = {
      date,
      merchant,
      amount: transactionType === "EXPENSE" ? -Math.abs(Number(amount)) : Math.abs(Number(amount)),
      paymentType,
      categoryId: finalCategoryId,
      memo,
      splits,
    };

    const res = transaction
      ? await fetch(`/api/transactions/${transaction.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch(`/api/transactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    setSaving(false);

    if (res.ok) {
      if (createRule && finalCategoryId && ruleKeyword.trim()) {
        const ruleResponse = await fetch("/api/category-rules/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: ruleKeyword.trim(), categoryId: finalCategoryId }),
        });

        if (!ruleResponse.ok && ruleResponse.status !== 409) {
          alert("거래는 저장했지만 자동 분류 규칙 생성에 실패했습니다.");
        }
      }
      onSaved();
      onClose();
    } else {
      alert("저장에 실패했습니다.");
    }
  };

  /** 삭제 */
  const handleDelete = async () => {
    if (!transaction) return;
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl bg-white p-5 shadow-lg">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">
            {transaction ? "거래 상세" : "내역 추가"}
          </h2>
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* 상단 입력 영역 */}
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
                inputMode="numeric"
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
              />
              <div className="text-[11px] text-gray-400 mt-0.5">
                {formattedAmount}
              </div>
            </div>
          </div>
          {transactionType === "EXPENSE" && Number(amount) > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-200 pt-3">
              <button type="button" onClick={() => setNWayOpen(true)} className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-xs text-gray-700 hover:border-violet-400 hover:text-violet-700"><Users size={15} />n빵 계산</button>
              <button type="button" onClick={() => setCategorySplitOpen(true)} className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-xs text-gray-700 hover:border-violet-400 hover:text-violet-700"><Split size={15} />카테고리 나누기{splits.length > 0 ? ` (${splits.length})` : ""}</button>
              {splits.length > 0 && <button type="button" onClick={() => setSplits([])} className="text-xs text-red-500">분할 해제</button>}
            </div>
          )}
        </div>

        {/* 거래 유형 */}
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">거래 유형</div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setTransactionType("EXPENSE")} className={`rounded-lg border px-3 py-2 text-sm ${transactionType === "EXPENSE" ? "border-red-400 bg-red-50 text-red-600" : "bg-white text-gray-600"}`}>지출</button>
            <button type="button" onClick={() => { setTransactionType("INCOME"); setSplits([]); setCreateRule(false); }} className={`rounded-lg border px-3 py-2 text-sm ${transactionType === "INCOME" ? "border-blue-400 bg-blue-50 text-blue-600" : "bg-white text-gray-600"}`}>수입</button>
          </div>
        </div>

        {/* 결제 방식 */}
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
          {splits.length > 0 && <div className="mb-3 rounded-lg bg-violet-50 px-3 py-2 text-xs text-violet-700">혼합 카테고리 {splits.length}개가 적용되어 있습니다. 위의 ‘카테고리 나누기’에서 수정하거나 분할을 해제하세요.</div>}

          <div className={`flex flex-wrap gap-2 mb-3 ${splits.length > 0 ? "pointer-events-none opacity-40" : ""}`}>
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
                  : "bg-white border-gray-300 text-gray-700"}
              `}
            >
              미분류
            </button>
          </div>

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

          {transactionType === "EXPENSE" && (childSelected !== null || parentSelected !== null) && (
            <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-3">
              <label className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium text-violet-950">
                <span>이 가맹점의 자동 분류 규칙 만들기</span>
                <input
                  type="checkbox"
                  checked={createRule}
                  onChange={(event) => {
                    setCreateRule(event.target.checked);
                    if (event.target.checked && !ruleKeyword.trim()) setRuleKeyword(merchant);
                  }}
                  className="h-4 w-4 accent-violet-600"
                />
              </label>
              {createRule && (
                <label className="mt-3 block text-xs text-violet-800">
                  가맹점명에 포함될 키워드
                  <input
                    value={ruleKeyword}
                    onChange={(event) => setRuleKeyword(event.target.value)}
                    placeholder="예: 스타벅스"
                    className="mt-1 w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-500"
                  />
                </label>
              )}
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
            placeholder="이 지출에 메모를 남겨보세요."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>

        {/* 하단 버튼 */}
        <div className="flex items-center justify-between mt-4">

          {/* 수정 모드에서만 삭제 버튼 표시 */}
          {transaction ? (
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
          ) : (
            <div />
          )}

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
              {saving ? "저장 중..." : transaction ? "저장" : "추가"}
            </button>
          </div>
        </div>

      </div>
      <NWaySplitModal
        open={nWayOpen}
        amount={Math.abs(Number(amount) || 0)}
        onClose={() => setNWayOpen(false)}
        onApply={(share) => {
          setAmount(String(share));
          setSplits([]);
          setNWayOpen(false);
        }}
      />
      <CategorySplitModal
        open={categorySplitOpen}
        totalAmount={Math.abs(Number(amount) || 0)}
        categories={categories}
        initialSplits={splits}
        onClose={() => setCategorySplitOpen(false)}
        onApply={(nextSplits) => {
          setSplits(nextSplits);
          setParentSelected(null);
          setChildSelected(null);
          setCreateRule(false);
          setCategorySplitOpen(false);
        }}
      />
    </div>
  );
}
