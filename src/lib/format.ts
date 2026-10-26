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

// 받침 유무에 따라 '로/으로'를 고른다. ㄹ 받침은 '로'를 쓰고, 한글로 끝나지 않으면 둘 다 적는다.
export function withRoParticle(word: string): string {
  const last = word.charCodeAt(word.length - 1);
  if (Number.isNaN(last) || last < 0xac00 || last > 0xd7a3) return `${word}(으)로`;
  const finalConsonant = (last - 0xac00) % 28;
  return `${word}${finalConsonant === 0 || finalConsonant === 8 ? "로" : "으로"}`;
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}
