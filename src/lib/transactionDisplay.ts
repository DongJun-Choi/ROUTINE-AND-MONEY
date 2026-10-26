import type { CategoryWithParent, PaymentType, Transaction } from "@/lib/types";

export const paymentTypeShortLabel: Record<PaymentType, string> = {
  CARD: "카드",
  POINT: "포인트",
  MIXED: "복합",
};

export function categoryPath(category: CategoryWithParent | null | undefined): string | null {
  if (!category) return null;
  return category.parent ? `${category.parent.name} › ${category.name}` : category.name;
}

export function parentCategoryName(category: CategoryWithParent | null | undefined): string | null {
  if (!category) return null;
  return category.parent?.name ?? category.name;
}

export function transactionCategoryLabel(transaction: Transaction): string | null {
  if (transaction.splits?.length) return `카테고리 ${transaction.splits.length}개로 나눔`;
  return categoryPath(transaction.category);
}
