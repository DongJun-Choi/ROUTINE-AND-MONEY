export interface TransactionSplitInput {
  amount: number;
  categoryId: number | null;
  label: string | null;
}

export function normalizeTransactionSplits(value: unknown, transactionAmount: number, transactionType: "INCOME" | "EXPENSE"): TransactionSplitInput[] {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new Error("분할 항목 형식이 올바르지 않습니다.");
  if (value.length === 0) return [];
  if (transactionType !== "EXPENSE") throw new Error("지출 거래만 분할할 수 있습니다.");
  if (value.length < 2) throw new Error("분할 항목은 2개 이상이어야 합니다.");
  if (value.length > 50) throw new Error("분할 항목은 최대 50개까지 만들 수 있습니다.");

  const splits = value.map((item) => {
    if (!item || typeof item !== "object") throw new Error("분할 항목 형식이 올바르지 않습니다.");
    const source = item as Record<string, unknown>;
    const amount = Number(source.amount);
    const categoryId = source.categoryId == null || source.categoryId === "" ? null : Number(source.categoryId);
    const label = String(source.label ?? "").trim().slice(0, 50) || null;

    if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("분할 금액은 1원 이상의 정수여야 합니다.");
    if (categoryId !== null && (!Number.isInteger(categoryId) || categoryId <= 0)) throw new Error("분할 카테고리가 올바르지 않습니다.");
    return { amount, categoryId, label };
  });

  const total = splits.reduce((sum, split) => sum + split.amount, 0);
  if (total !== transactionAmount) throw new Error("분할 금액의 합계는 결제 금액과 같아야 합니다.");
  return splits;
}
