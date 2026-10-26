import { Check, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import TransactionDaySection from "@/components/transactions/TransactionDaySection";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { formatNumber } from "@/lib/format";
import type { TransactionDayGroup, TypeFilter } from "@/lib/transactions/summary";
import type { Transaction } from "@/lib/types";

interface TransactionListCardProps {
  status: "loading" | "ready" | "error";
  groups: TransactionDayGroup[];
  typeFilter: TypeFilter;
  typeCounts: Record<TypeFilter, number>;
  onTypeChange: (type: TypeFilter) => void;
  uncategorizedCount: number;
  onlyUncategorized: boolean;
  onToggleUncategorized: () => void;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  activeFilterCount: number;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  filterPanel: ReactNode;
  filterPanelId: string;
  todayKey: string;
  onSelect: (transaction: Transaction) => void;
  onRetry: () => void;
  className?: string;
}

function EmptyState({ children }: { children: ReactNode }) {
  return <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line-strong px-4 text-center text-sm text-muted">{children}</div>;
}

function ListSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-2">
      <div className="h-5 w-32 animate-pulse rounded-md bg-subtle" />
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex items-center gap-3 rounded-xl border border-subtle px-3.5 py-3">
          <div className="size-10 animate-pulse rounded-xl bg-subtle" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-40 animate-pulse rounded bg-subtle" />
            <div className="h-3 w-24 animate-pulse rounded bg-subtle" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TransactionListCard({
  status,
  groups,
  typeFilter,
  typeCounts,
  onTypeChange,
  uncategorizedCount,
  onlyUncategorized,
  onToggleUncategorized,
  filtersOpen,
  onToggleFilters,
  activeFilterCount,
  hasActiveFilters,
  onResetFilters,
  filterPanel,
  filterPanelId,
  todayKey,
  onSelect,
  onRetry,
  className = "",
}: TransactionListCardProps) {
  const loadingFirstTime = status === "loading" && groups.length === 0;

  return (
    <Card aria-label="거래 내역" className={`gap-5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl<TypeFilter>
          label="거래 유형"
          value={typeFilter}
          onChange={onTypeChange}
          className="max-sm:w-full"
          stretch
          options={[
            { value: "all", label: `전체 ${formatNumber(typeCounts.all)}` },
            { value: "expense", label: `지출 ${formatNumber(typeCounts.expense)}` },
            { value: "income", label: `수입 ${formatNumber(typeCounts.income)}` },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          {(uncategorizedCount > 0 || onlyUncategorized) && (
            <button
              type="button"
              aria-pressed={onlyUncategorized}
              onClick={onToggleUncategorized}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-[10px] border bg-pending-soft px-3.5 text-[13px] font-semibold whitespace-nowrap text-pending ${onlyUncategorized ? "border-pending" : "border-pending-line"}`}
            >
              {onlyUncategorized && <Check size={14} strokeWidth={2.4} aria-hidden="true" />}
              미분류 {formatNumber(uncategorizedCount)}건
            </button>
          )}
          <Button aria-expanded={filtersOpen} aria-controls={filterPanelId} onClick={onToggleFilters} className="text-[13px]">
            <SlidersHorizontal size={16} strokeWidth={2} aria-hidden="true" />
            필터
            {activeFilterCount > 0 && <Chip tone="primary">{activeFilterCount}</Chip>}
          </Button>
        </div>
      </div>

      {filtersOpen && filterPanel}

      {status === "error" ? (
        <EmptyState>
          <p className="m-0 text-danger">거래 내역을 불러오지 못했어요.</p>
          <Button onClick={onRetry}>다시 시도</Button>
        </EmptyState>
      ) : loadingFirstTime ? (
        <ListSkeleton />
      ) : groups.length === 0 ? (
        <EmptyState>
          <p className="m-0">{hasActiveFilters ? "조건에 맞는 거래 내역이 없어요." : "이 달에는 거래 내역이 없어요."}</p>
          {hasActiveFilters && <Button onClick={onResetFilters}>조건 모두 지우기</Button>}
        </EmptyState>
      ) : (
        <div aria-busy={status === "loading"} className={`flex flex-col gap-5 transition-opacity ${status === "loading" ? "opacity-60" : ""}`}>
          {groups.map((group) => <TransactionDaySection key={group.date} group={group} isToday={group.date === todayKey} onSelect={onSelect} />)}
        </div>
      )}
    </Card>
  );
}
