import { useCallback, useEffect, useState } from "react";
import type { YearMonth } from "@/lib/date";
import { fetchJson } from "@/lib/fetchJson";
import type { Category, Transaction } from "@/lib/types";

type LoadStatus = "loading" | "ready" | "error";

export function useMonthTransactions({ year, month }: YearMonth) {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetchJson<{ transactions: Transaction[] }>(`/api/transactions?year=${year}&month=${month}`)
      .then((response) => {
        if (cancelled) return;
        setTransactions(response.transactions);
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

  return { status, transactions, reload };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchJson<{ categories: Category[] }>("/api/categories")
      .then((response) => {
        if (!cancelled) setCategories(response.categories);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return categories;
}
