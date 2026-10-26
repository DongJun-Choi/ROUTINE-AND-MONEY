export interface SplitDraft {
  amount: number;
  categoryId: number | null;
  label: string;
}

// 서버(lib/transactionSplits)와 같은 분할 규칙을 화면에서도 미리 검사한다.
export const MIN_SPLITS = 2;
export const MAX_SPLITS = 50;
export const SPLIT_LABEL_MAX_LENGTH = 50;
export const MIN_PEOPLE = 2;
export const MAX_PEOPLE = 50;

export function initialSplitDrafts(total: number, existing: SplitDraft[]): SplitDraft[] {
  if (existing.length >= MIN_SPLITS) return existing;
  return [
    { amount: Math.ceil(total / 2), categoryId: null, label: "" },
    { amount: Math.floor(total / 2), categoryId: null, label: "" },
  ];
}

export function nextSplitDraft(difference: number): SplitDraft {
  return { amount: Math.max(1, difference), categoryId: null, label: "" };
}

export function evaluateSplits(total: number, drafts: SplitDraft[]) {
  const allocated = drafts.reduce((sum, draft) => sum + (Number.isSafeInteger(draft.amount) ? draft.amount : 0), 0);
  const difference = total - allocated;
  const hasEmpty = drafts.some((draft) => !Number.isSafeInteger(draft.amount) || draft.amount <= 0);
  return {
    allocated,
    difference,
    hasEmpty,
    canApply: drafts.length >= MIN_SPLITS && drafts.length <= MAX_SPLITS && difference === 0 && !hasEmpty,
  };
}

export function clampPeople(value: number): number {
  if (!Number.isFinite(value)) return MIN_PEOPLE;
  return Math.min(MAX_PEOPLE, Math.max(MIN_PEOPLE, Math.round(value)));
}

// 나누어 떨어지지 않으면 1원 미만을 올림해 내 몫에 얹는다(기존 n빵 계산과 같은 규칙).
export function splitEvenly(amount: number, people: number) {
  const safePeople = clampPeople(people);
  return { people: safePeople, share: Math.ceil(amount / safePeople), hasRemainder: amount % safePeople !== 0 };
}
