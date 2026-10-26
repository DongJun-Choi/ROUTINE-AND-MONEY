import { compareYearMonth, daysInMonth, type YearMonth } from "@/lib/date";
import type { Category, Transaction } from "@/lib/types";

export interface DashboardSummaryResponse {
  income: number;
  expense: number;
  net: number;
  count: number;
}

export interface CategoryTotalRow {
  categoryId: number | null;
  categoryName: string;
  parentId: number | null;
  amount: number;
}

export interface MonthlyRow {
  month: number;
  expense: number;
}

export interface DailyRow {
  date: string;
  expense: number;
}

export interface DashboardSource {
  summary: DashboardSummaryResponse;
  previousSummary: DashboardSummaryResponse;
  categoryRows: CategoryTotalRow[];
  previousCategoryRows: CategoryTotalRow[];
  categories: Category[];
  monthly: MonthlyRow[];
  previousYearMonthly: MonthlyRow[];
  daily: DailyRow[];
  transactions: Transaction[];
}

export interface CategoryGroup {
  key: string;
  name: string;
  amount: number;
  share: number;
}

export interface SeriesPoint {
  key: string;
  year: number;
  month: number;
  value: number;
  highlight: boolean;
}

export interface DailyPoint {
  day: number;
  weekday: number;
  value: number;
}

export interface DailySummary {
  points: DailyPoint[];
  elapsedDays: number;
  average: number;
  peak: DailyPoint | null;
  weekendShare: number | null;
}

export interface DashboardView {
  transactionCount: number;
  expense: { amount: number; previous: number; changePercent: number | null };
  income: { amount: number; count: number };
  net: number;
  topCategory: CategoryGroup | null;
  categoryGroups: CategoryGroup[];
  categoryTotal: number;
  categoryInsight: { name: string; changePercent: number } | null;
  yearSeries: SeriesPoint[];
  recentSeries: SeriesPoint[];
  daily: DailySummary;
  recentTransactions: Transaction[];
}

// 도넛 조각이 너무 잘게 나뉘지 않도록 상위 5개만 따로 두고 나머지는 "그 외"로 묶는다.
const CATEGORY_SLICE_LIMIT = 6;
const RECENT_TRANSACTION_LIMIT = 5;
const UNCATEGORIZED_KEY = "uncategorized";

export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

function groupByParentCategory(rows: CategoryTotalRow[], categories: Category[]): Omit<CategoryGroup, "share">[] {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const groups = new Map<string, Omit<CategoryGroup, "share">>();

  for (const row of rows) {
    const parentId = row.categoryId === null ? null : row.parentId ?? row.categoryId;
    const key = parentId === null ? UNCATEGORIZED_KEY : String(parentId);
    const name = parentId === null ? "미분류" : categoryById.get(parentId)?.name ?? row.categoryName;
    const group = groups.get(key) ?? { key, name, amount: 0 };
    group.amount += row.amount;
    groups.set(key, group);
  }

  return [...groups.values()].filter((group) => group.amount > 0).sort((a, b) => b.amount - a.amount);
}

function limitGroups(groups: Omit<CategoryGroup, "share">[]): Omit<CategoryGroup, "share">[] {
  if (groups.length <= CATEGORY_SLICE_LIMIT) return groups;
  const head = groups.slice(0, CATEGORY_SLICE_LIMIT - 1);
  const restAmount = groups.slice(CATEGORY_SLICE_LIMIT - 1).reduce((sum, group) => sum + group.amount, 0);
  return [...head, { key: "rest", name: "그 외", amount: restAmount }];
}

function monthlyValue(rows: MonthlyRow[], month: number): number {
  return rows.find((row) => row.month === month)?.expense ?? 0;
}

function buildYearSeries(period: YearMonth, rows: MonthlyRow[], current: YearMonth): SeriesPoint[] {
  const lastMonth = period.year === current.year ? Math.max(current.month, period.month) : 12;
  return Array.from({ length: lastMonth }, (_, index) => {
    const month = index + 1;
    return { key: `${period.year}-${month}`, year: period.year, month, value: monthlyValue(rows, month), highlight: month === period.month };
  });
}

function buildRecentSeries(period: YearMonth, thisYear: MonthlyRow[], lastYear: MonthlyRow[]): SeriesPoint[] {
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(period.year, period.month - 12 + index, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const rows = year === period.year ? thisYear : lastYear;
    return { key: `${year}-${month}`, year, month, value: monthlyValue(rows, month), highlight: year === period.year && month === period.month };
  });
}

function summarizeDaily(period: YearMonth, rows: DailyRow[], elapsedDays: number): DailySummary {
  const valueByDay = new Map(rows.map((row) => [Number(row.date.slice(8, 10)), row.expense]));
  const points = Array.from({ length: daysInMonth(period.year, period.month) }, (_, index) => {
    const day = index + 1;
    return { day, weekday: new Date(period.year, period.month - 1, day).getDay(), value: valueByDay.get(day) ?? 0 };
  });

  const total = points.reduce((sum, point) => sum + point.value, 0);
  const elapsedTotal = points.slice(0, elapsedDays).reduce((sum, point) => sum + point.value, 0);
  const weekendTotal = points.filter((point) => point.weekday === 0 || point.weekday === 6).reduce((sum, point) => sum + point.value, 0);
  const peak = points.reduce<DailyPoint | null>((best, point) => (point.value > (best?.value ?? 0) ? point : best), null);

  return {
    points,
    elapsedDays,
    average: elapsedDays > 0 ? Math.round(elapsedTotal / elapsedDays) : 0,
    peak,
    weekendShare: total > 0 ? weekendTotal / total : null,
  };
}

export function buildDashboardView(source: DashboardSource, period: YearMonth, today: Date): DashboardView {
  const current = { year: today.getFullYear(), month: today.getMonth() + 1 };
  const relation = compareYearMonth(period, current);
  const elapsedDays = relation < 0 ? daysInMonth(period.year, period.month) : relation === 0 ? today.getDate() : 0;

  const groups = groupByParentCategory(source.categoryRows, source.categories);
  const categoryTotal = groups.reduce((sum, group) => sum + group.amount, 0);
  const categoryGroups = limitGroups(groups).map((group) => ({ ...group, share: categoryTotal > 0 ? group.amount / categoryTotal : 0 }));

  // 미분류는 어떤 소비인지 알려 주지 않으므로 "가장 많이 쓴 카테고리"와 비교 문구에서는 뺀다.
  const topGroup = groups.find((group) => group.key !== UNCATEGORIZED_KEY);
  const previousTop = topGroup ? groupByParentCategory(source.previousCategoryRows, source.categories).find((group) => group.key === topGroup.key) : undefined;
  const topChange = topGroup && previousTop ? percentChange(topGroup.amount, previousTop.amount) : null;

  return {
    transactionCount: source.summary.count,
    expense: {
      amount: source.summary.expense,
      previous: source.previousSummary.expense,
      changePercent: percentChange(source.summary.expense, source.previousSummary.expense),
    },
    income: {
      amount: source.summary.income,
      count: source.transactions.filter((transaction) => transaction.type === "INCOME").length,
    },
    net: source.summary.net,
    topCategory: topGroup ? { ...topGroup, share: categoryTotal > 0 ? topGroup.amount / categoryTotal : 0 } : null,
    categoryGroups,
    categoryTotal,
    categoryInsight: topGroup && topChange !== null ? { name: topGroup.name, changePercent: topChange } : null,
    yearSeries: buildYearSeries(period, source.monthly, current),
    recentSeries: buildRecentSeries(period, source.monthly, source.previousYearMonthly),
    daily: summarizeDaily(period, source.daily, elapsedDays),
    recentTransactions: source.transactions.slice(0, RECENT_TRANSACTION_LIMIT),
  };
}
