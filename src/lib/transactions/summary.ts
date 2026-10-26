import type { Category, PaymentType, Transaction } from "@/lib/types";

export type TypeFilter = "all" | "expense" | "income";

export interface TransactionFilters {
  query: string;
  categoryId: number | null;
  paymentType: PaymentType | null;
  type: TypeFilter;
  onlyUncategorized: boolean;
}

export const EMPTY_FILTERS: TransactionFilters = {
  query: "",
  categoryId: null,
  paymentType: null,
  type: "all",
  onlyUncategorized: false,
};

export interface TransactionTotals {
  expense: number;
  income: number;
  net: number;
  count: number;
}

export interface DayTotals {
  expense: number;
  income: number;
}

export interface TransactionDayGroup extends DayTotals {
  date: string;
  transactions: Transaction[];
}

export interface TransactionView {
  totals: TransactionTotals;
  groups: TransactionDayGroup[];
  dailyTotals: Record<string, DayTotals>;
  paymentTotals: Record<PaymentType, number>;
  typeCounts: Record<TypeFilter, number>;
  uncategorizedCount: number;
  activeFilterCount: number;
}

export function isUncategorized(transaction: Transaction): boolean {
  return transaction.type === "EXPENSE" && !transaction.splits?.length && transaction.categoryId === null;
}

function matchesType(transaction: Transaction, type: TypeFilter): boolean {
  if (type === "expense") return transaction.type === "EXPENSE";
  if (type === "income") return transaction.type === "INCOME";
  return true;
}

function dateKeyOf(transaction: Transaction): string {
  return transaction.date.slice(0, 10);
}

export function buildTransactionView(transactions: Transaction[], filters: TransactionFilters, categories: Category[]): TransactionView {
  const query = filters.query.trim().toLocaleLowerCase("ko-KR");
  // 대분류로 거르면 그 아래 하위 카테고리와 분할 항목의 카테고리까지 함께 찾는다.
  const familyIds = filters.categoryId === null
    ? null
    : new Set([filters.categoryId, ...categories.filter((category) => category.parentId === filters.categoryId).map((category) => category.id)]);

  const base = transactions.filter((transaction) => {
    if (query && !`${transaction.merchant} ${transaction.memo ?? ""}`.toLocaleLowerCase("ko-KR").includes(query)) return false;
    if (familyIds) {
      const categoryIds = transaction.splits?.length ? transaction.splits.map((split) => split.categoryId) : [transaction.categoryId];
      if (!categoryIds.some((id) => id !== null && familyIds.has(id))) return false;
    }
    if (filters.paymentType && transaction.paymentType !== filters.paymentType) return false;
    if (filters.onlyUncategorized && !isUncategorized(transaction)) return false;
    return true;
  });
  const filtered = base.filter((transaction) => matchesType(transaction, filters.type));

  const totals: TransactionTotals = { expense: 0, income: 0, net: 0, count: filtered.length };
  const dailyTotals: Record<string, DayTotals> = {};
  const paymentTotals: Record<PaymentType, number> = { CARD: 0, POINT: 0, MIXED: 0 };
  const groupMap = new Map<string, TransactionDayGroup>();

  for (const transaction of filtered) {
    const key = dateKeyOf(transaction);
    const day = dailyTotals[key] ?? { expense: 0, income: 0 };
    const group = groupMap.get(key) ?? { date: key, transactions: [], expense: 0, income: 0 };

    if (transaction.type === "EXPENSE") {
      totals.expense += transaction.amount;
      day.expense += transaction.amount;
      group.expense += transaction.amount;
      paymentTotals[transaction.paymentType] = (paymentTotals[transaction.paymentType] ?? 0) + transaction.amount;
    } else {
      totals.income += transaction.amount;
      day.income += transaction.amount;
      group.income += transaction.amount;
    }

    group.transactions.push(transaction);
    dailyTotals[key] = day;
    groupMap.set(key, group);
  }
  totals.net = totals.income - totals.expense;

  return {
    totals,
    groups: [...groupMap.values()].sort((a, b) => (a.date < b.date ? 1 : -1)),
    dailyTotals,
    paymentTotals,
    typeCounts: {
      all: base.length,
      expense: base.filter((transaction) => transaction.type === "EXPENSE").length,
      income: base.filter((transaction) => transaction.type === "INCOME").length,
    },
    uncategorizedCount: transactions.filter(isUncategorized).length,
    activeFilterCount: (query ? 1 : 0) + (filters.categoryId !== null ? 1 : 0) + (filters.paymentType ? 1 : 0),
  };
}
