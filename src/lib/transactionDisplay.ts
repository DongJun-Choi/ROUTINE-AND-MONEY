import type { CategoryWithParent, Transaction } from "@/lib/types";

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
