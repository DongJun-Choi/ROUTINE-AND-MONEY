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

export function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\w가-힣]/g, "")
    .trim();
}

export function findCategoryId(
  merchant: string,
  rules: CategoryRuleItem[]
): number | null {

  const normalizedName = normalize(merchant);

  for (const r of rules) {
    const normalizedKeyword = normalize(r.keyword);

    if (normalizedName.includes(normalizedKeyword)) {
      return r.categoryId;
    }
  }

  return null;
}