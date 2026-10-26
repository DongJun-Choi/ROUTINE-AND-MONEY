import { useCallback, useEffect, useState } from "react";
import type { CategoryRule } from "@/lib/categories/api";
import { fetchJson } from "@/lib/fetchJson";
import type { Category, Transaction } from "@/lib/types";

type LoadStatus = "loading" | "ready" | "error";

function useLoader<T>(url: string, pick: (response: unknown) => T, initial: T, version: number) {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [data, setData] = useState<T>(initial);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetchJson<unknown>(url)
      .then((response) => {
        if (cancelled) return;
        setData(pick(response));
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [url, pick, reloadKey, version]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);
  return { status, data, reload };
}

const pickCategories = (response: unknown) => (response as { categories: Category[] }).categories;
const pickRules = (response: unknown) => response as CategoryRule[];

// 서버의 삭제 검사와 같이, 거래에 직접 지정된 카테고리와 분할 항목의 카테고리를 함께 센다.
function countUsage(response: unknown): Map<number, number> {
  const usage = new Map<number, number>();
  const add = (categoryId: number | null) => {
    if (categoryId !== null) usage.set(categoryId, (usage.get(categoryId) ?? 0) + 1);
  };
  for (const transaction of (response as { transactions: Transaction[] }).transactions) {
    add(transaction.categoryId);
    transaction.splits?.forEach((split) => add(split.categoryId));
  }
  return usage;
}

export function useCategoryList(version: number) {
  const { status, data, reload } = useLoader<Category[]>("/api/categories", pickCategories, [], version);
  return { status, categories: data, reload };
}

export function useCategoryUsage(version: number) {
  const { status, data } = useLoader<Map<number, number>>("/api/transactions", countUsage, new Map(), version);
  return status === "ready" ? data : null;
}

export function useCategoryRules(version: number) {
  const { status, data, reload } = useLoader<CategoryRule[]>("/api/category-rules", pickRules, [], version);
  return { status, rules: data, reload };
}
