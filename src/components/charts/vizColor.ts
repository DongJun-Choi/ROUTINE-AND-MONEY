// 카테고리·분할 항목 색은 순서대로 토큰 보드의 차트 팔레트(--viz-1~6)를 쓴다.
export function vizColor(index: number): string {
  return `var(--viz-${Math.min(index + 1, 6)})`;
}
