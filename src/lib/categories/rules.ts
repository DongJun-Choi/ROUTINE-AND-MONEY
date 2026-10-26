import type { CategoryRule } from "@/lib/categories/api";
import type { Category } from "@/lib/types";

// 대분류로 거르면 그 아래 소분류에 걸린 규칙까지 함께 보여 준다.
export function filterRules(rules: CategoryRule[], categories: Category[], query: string, categoryId: number | null): CategoryRule[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
  const family = categoryId === null
    ? null
    : new Set([categoryId, ...categories.filter((category) => category.parentId === categoryId).map((category) => category.id)]);

  return rules.filter((rule) => {
    if (normalizedQuery && !rule.keyword.toLocaleLowerCase("ko-KR").includes(normalizedQuery)) return false;
    if (family && !family.has(rule.categoryId)) return false;
    return true;
  });
}
