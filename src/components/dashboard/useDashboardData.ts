import { useCallback, useEffect, useState } from "react";
import type { CategoryTotalRow, DailyRow, DashboardSource, DashboardSummaryResponse, MonthlyRow } from "@/lib/dashboard/stats";
import { shiftMonth, type YearMonth } from "@/lib/date";
import { fetchJson } from "@/lib/fetchJson";
import type { Category, Transaction } from "@/lib/types";

type DashboardStatus = "loading" | "ready" | "error";

export interface LoadedDashboard {
  period: YearMonth;
  data: DashboardSource;
}

export function useDashboardData({ year, month }: YearMonth) {
  const [status, setStatus] = useState<DashboardStatus>("loading");
  const [loaded, setLoaded] = useState<LoadedDashboard | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const previous = shiftMonth({ year, month }, -1);
    setStatus("loading");

    Promise.all([
      fetchJson<DashboardSummaryResponse>(`/api/dashboard/summary?year=${year}&month=${month}`),
      fetchJson<DashboardSummaryResponse>(`/api/dashboard/summary?year=${previous.year}&month=${previous.month}`),
      fetchJson<CategoryTotalRow[]>(`/api/dashboard/category?year=${year}&month=${month}`),
      fetchJson<CategoryTotalRow[]>(`/api/dashboard/category?year=${previous.year}&month=${previous.month}`),
      fetchJson<{ categories: Category[] }>("/api/categories"),
      fetchJson<MonthlyRow[]>(`/api/dashboard/monthly?year=${year}`),
      fetchJson<MonthlyRow[]>(`/api/dashboard/monthly?year=${year - 1}`),
      fetchJson<DailyRow[]>(`/api/dashboard/daily?year=${year}&month=${month}`),
      fetchJson<{ transactions: Transaction[] }>(`/api/transactions?year=${year}&month=${month}`),
    ])
      .then(([summary, previousSummary, categoryRows, previousCategoryRows, categoryResponse, monthly, previousYearMonthly, daily, transactionResponse]) => {
        if (cancelled) return;
        setLoaded({
          period: { year, month },
          data: {
            summary,
            previousSummary,
            categoryRows,
            previousCategoryRows,
            categories: categoryResponse.categories,
            monthly,
            previousYearMonthly,
            daily,
            transactions: transactionResponse.transactions,
          },
        });
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [year, month, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { status, loaded, reload };
}
