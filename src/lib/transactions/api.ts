import { jsonRequest, sendMutation, type MutationResult } from "@/lib/http";
import type { SplitDraft } from "@/lib/transactions/split";
import type { PaymentType } from "@/lib/types";

export interface TransactionPayload {
  date: string;
  merchant: string;
  amount: number;
  paymentType: PaymentType;
  categoryId: number | null;
  memo: string;
  splits: SplitDraft[];
}

export function saveTransaction(payload: TransactionPayload, id?: number): Promise<MutationResult> {
  return sendMutation(id ? `/api/transactions/${id}` : "/api/transactions", jsonRequest(id ? "PUT" : "POST", payload), "저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
}

export function deleteTransaction(id: number): Promise<MutationResult> {
  return sendMutation(`/api/transactions/${id}`, { method: "DELETE" }, "삭제하지 못했어요. 잠시 후 다시 시도해 주세요.");
}

// 같은 키워드·카테고리 규칙이 이미 있으면(409) 새로 만들지 않아도 되므로 성공으로 본다.
export async function createCategoryRule(keyword: string, categoryId: number): Promise<boolean> {
  try {
    const response = await fetch("/api/category-rules/add", jsonRequest("POST", { keyword, categoryId }));
    return response.ok || response.status === 409;
  } catch {
    return false;
  }
}
