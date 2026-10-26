import { NETWORK_ERROR_MESSAGE } from "@/lib/http";
import type { Transaction } from "@/lib/types";

export type StatementKind = "excel" | "vestmail";

export const STATEMENT_ACCEPT = ".xlsx,.xls,.html,.htm";

export const statementKindLabel: Record<StatementKind, string> = {
  excel: "카드사 엑셀 명세서",
  vestmail: "보안메일 HTML",
};

// 서버(importCardStatements)와 같은 기준으로 확장자만 보고 엑셀과 보안메일 HTML을 나눈다.
export function statementKind(fileName: string): StatementKind | null {
  if (/\.xlsx?$/i.test(fileName)) return "excel";
  if (/\.html?$/i.test(fileName)) return "vestmail";
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export type UploadResult =
  | { status: "saved"; count: number; preview: Transaction[] }
  | { status: "duplicate" }
  | { status: "error"; message: string };

export async function uploadStatement(file: File, password: string): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("password", password);

  try {
    const response = await fetch("/api/upload", { method: "POST", body: formData });
    const body = (await response.json().catch(() => null)) as { count?: number; preview?: Transaction[]; duplicate?: boolean; message?: string } | null;
    if (response.ok) return { status: "saved", count: body?.count ?? 0, preview: body?.preview ?? [] };
    if (body?.duplicate) return { status: "duplicate" };
    // 비밀번호가 틀리거나 형식이 다른 파일은 서버에서 읽기 단계 오류(5xx)로 끝난다.
    if (response.status >= 500) return { status: "error", message: "명세서를 읽지 못했어요. 파일 형식과 보안메일 비밀번호를 확인해 주세요." };
    return { status: "error", message: body?.message ?? "업로드하지 못했어요. 잠시 후 다시 시도해 주세요." };
  } catch {
    return { status: "error", message: NETWORK_ERROR_MESSAGE };
  }
}

export interface PreviewSummary {
  monthLabel: string | null;
  total: number;
  categorized: number;
  uncategorized: number;
  rows: Transaction[];
}

// 업로드 응답의 미리보기는 그 달 전체 거래라서, 화면에는 날짜 역순으로 정렬해 앞부분만 보여 준다.
export function summarizePreview(preview: Transaction[], limit: number): PreviewSummary {
  const sorted = [...preview].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));
  const uncategorized = sorted.filter((transaction) => transaction.categoryId === null && !transaction.splits?.length).length;
  const first = sorted[0];
  return {
    monthLabel: first ? `${Number(first.date.slice(0, 4))}년 ${Number(first.date.slice(5, 7))}월` : null,
    total: sorted.length,
    categorized: sorted.length - uncategorized,
    uncategorized,
    rows: sorted.slice(0, limit),
  };
}
