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

export type MutationResult = { ok: true } | { ok: false; message: string };

const NETWORK_ERROR = "서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.";

// 서버 오류(5xx) 메시지는 영어 내부 문구라서 사용자에게는 정해 둔 안내 문구를 보여 준다.
async function failureMessage(response: Response, fallback: string): Promise<string> {
  if (response.status >= 500) return fallback;
  const body = (await response.json().catch(() => null)) as { message?: string; error?: string } | null;
  return body?.message ?? body?.error ?? fallback;
}

export async function saveTransaction(payload: TransactionPayload, id?: number): Promise<MutationResult> {
  try {
    const response = await fetch(id ? `/api/transactions/${id}` : "/api/transactions", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) return { ok: true };
    return { ok: false, message: await failureMessage(response, "저장하지 못했어요. 잠시 후 다시 시도해 주세요.") };
  } catch {
    return { ok: false, message: NETWORK_ERROR };
  }
}

export async function deleteTransaction(id: number): Promise<MutationResult> {
  try {
    const response = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (response.ok) return { ok: true };
    return { ok: false, message: await failureMessage(response, "삭제하지 못했어요. 잠시 후 다시 시도해 주세요.") };
  } catch {
    return { ok: false, message: NETWORK_ERROR };
  }
}

// 같은 키워드·카테고리 규칙이 이미 있으면(409) 새로 만들지 않아도 되므로 성공으로 본다.
export async function createCategoryRule(keyword: string, categoryId: number): Promise<boolean> {
  try {
    const response = await fetch("/api/category-rules/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword, categoryId }),
    });
    return response.ok || response.status === 409;
  } catch {
    return false;
  }
}
