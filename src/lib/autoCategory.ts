import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface CategoryRuleItem {
  keyword: string;
  categoryId: number;
}

export async function loadCategoryRules(): Promise<CategoryRuleItem[]> {
  const rules = await prisma.categoryRule.findMany();
  return rules.map((r: { keyword: string; categoryId: number }) => ({
    keyword: r.keyword,
    categoryId: r.categoryId,
  }));
}

export function findCategoryId(
  merchant: string,
  rules: CategoryRuleItem[]
): number | null {
  const name = merchant.trim();

  for (const r of rules) {
    if (name.includes(r.keyword)) {
      return r.categoryId;
    }
  }

  return null;
}