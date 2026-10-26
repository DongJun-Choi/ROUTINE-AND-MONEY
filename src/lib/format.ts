import type { TransactionType } from "@/lib/types";

// 금액 부호는 숫자 폭과 맞는 U+2212 빼기 기호를 쓴다.
const MINUS_SIGN = "−";

export function formatNumber(value: number): string {
  return value.toLocaleString("ko-KR");
}

export function formatSignedNumber(value: number): string {
  if (value < 0) return `${MINUS_SIGN}${formatNumber(Math.abs(value))}`;
  if (value > 0) return `+${formatNumber(value)}`;
  return "0";
}

export function formatTransactionAmount(amount: number, type: TransactionType): string {
  return `${type === "EXPENSE" ? MINUS_SIGN : "+"}${formatNumber(Math.abs(amount))}원`;
}

export function formatCompactWon(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 100_000_000) return `${(value / 100_000_000).toFixed(1).replace(/\.0$/, "")}억`;
  if (abs >= 10_000) return `${Math.round(value / 10_000)}만`;
  if (abs >= 1_000) return `${Math.round(value / 1_000)}천`;
  return formatNumber(value);
}

// 달력 칸처럼 좁은 곳에서는 10만 원 미만을 소수 한 자리 만 원 단위로 줄인다.
export function formatShortWon(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 100_000) return `${Math.round(value / 10_000)}만`;
  if (abs >= 10_000) return `${(value / 10_000).toFixed(1).replace(/\.0$/, "")}만`;
  if (abs >= 1_000) return `${Math.round(value / 1_000)}천`;
  return formatNumber(value);
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}
