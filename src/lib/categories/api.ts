import { jsonRequest, NETWORK_ERROR_MESSAGE, responseErrorMessage, sendMutation, type MutationResult } from "@/lib/http";
import type { Category } from "@/lib/types";

export interface CategoryRule {
  id: number;
  keyword: string;
  categoryId: number;
  category?: Category | null;
}

export type DeleteCategoryResult =
  | { status: "deleted" }
  | { status: "in-use"; usedCount: number }
  | { status: "error"; message: string };

export function createSubcategory(name: string, parentId: number): Promise<MutationResult> {
  return sendMutation("/api/categories", jsonRequest("POST", { name, parentId }), "소분류를 추가하지 못했어요. 같은 이름이 이미 있는지 확인해 주세요.");
}

export function renameCategory(id: number, name: string): Promise<MutationResult> {
  return sendMutation(`/api/categories/${id}`, jsonRequest("PUT", { name }), "이름을 바꾸지 못했어요. 같은 이름이 이미 있는지 확인해 주세요.");
}

// 거래가 연결된 카테고리는 서버가 지우지 않고 사용 건수만 돌려주므로, 거래를 옮긴 뒤 다시 지운다.
export async function deleteCategory(id: number): Promise<DeleteCategoryResult> {
  try {
    const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const body = (await response.clone().json().catch(() => null)) as { used?: boolean; usedCount?: number; deleted?: boolean } | null;
    if (body?.used) return { status: "in-use", usedCount: Number(body.usedCount) || 0 };
    if (response.ok && body?.deleted) return { status: "deleted" };
    return { status: "error", message: await responseErrorMessage(response, "카테고리를 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.") };
  } catch {
    return { status: "error", message: NETWORK_ERROR_MESSAGE };
  }
}

export function moveCategoryTransactions(oldId: number, newId: number | null): Promise<MutationResult> {
  return sendMutation("/api/transactions/move-category", jsonRequest("POST", { oldId, newId }), "거래를 옮기지 못했어요. 잠시 후 다시 시도해 주세요.");
}

export function addCategoryRule(keyword: string, categoryId: number): Promise<MutationResult> {
  return sendMutation("/api/category-rules/add", jsonRequest("POST", { keyword, categoryId }), "규칙을 추가하지 못했어요. 잠시 후 다시 시도해 주세요.");
}

export function updateCategoryRule(id: number, keyword: string, categoryId: number): Promise<MutationResult> {
  return sendMutation(`/api/category-rules/${id}`, jsonRequest("PUT", { keyword, categoryId }), "규칙을 고치지 못했어요. 잠시 후 다시 시도해 주세요.");
}

export function deleteCategoryRule(id: number): Promise<MutationResult> {
  return sendMutation(`/api/category-rules/${id}`, { method: "DELETE" }, "규칙을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.");
}

export function isDuplicateCategoryName(categories: Category[], name: string, exceptId?: number): boolean {
  const normalized = name.trim();
  return categories.some((category) => category.id !== exceptId && category.name === normalized);
}
