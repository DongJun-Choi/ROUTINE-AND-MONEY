"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import TransactionDetailModal from "@/components/TransactionDetailModal";
import PaymentBreakdownCard from "@/components/transactions/PaymentBreakdownCard";
import TransactionCalendar from "@/components/transactions/TransactionCalendar";
import TransactionFilterPanel from "@/components/transactions/TransactionFilterPanel";
import TransactionListCard from "@/components/transactions/TransactionListCard";
import TransactionSummaryStrip from "@/components/transactions/TransactionSummaryStrip";
import { useCategories, useMonthTransactions } from "@/components/transactions/useTransactionsData";
import Button from "@/components/ui/Button";
import MonthSwitcher from "@/components/ui/MonthSwitcher";
import PageHeader from "@/components/ui/PageHeader";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { compareYearMonth, shiftMonth, toDateKey, type YearMonth } from "@/lib/date";
import { buildTransactionView, EMPTY_FILTERS, type TransactionFilters } from "@/lib/transactions/summary";
import type { Transaction } from "@/lib/types";

type MobileView = "list" | "calendar";

const FILTER_PANEL_ID = "transaction-filters";

export default function TransactionsPage() {
  const [today] = useState(() => new Date());
  const todayKey = toDateKey(today);
  const currentPeriod: YearMonth = { year: today.getFullYear(), month: today.getMonth() + 1 };
  // 이전 화면과 같이 올해 12월 뒤로는 넘어가지 않는다.
  const lastPeriod: YearMonth = { year: currentPeriod.year, month: 12 };

  const [period, setPeriod] = useState<YearMonth>(currentPeriod);
  const [selectedDate, setSelectedDate] = useState<string | null>(todayKey);
  const [filters, setFilters] = useState<TransactionFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const [detail, setDetail] = useState<{ open: boolean; transaction: Transaction | null }>({ open: false, transaction: null });

  const { status, transactions, reload } = useMonthTransactions(period);
  const categories = useCategories();
  const view = useMemo(() => buildTransactionView(transactions, filters, categories), [transactions, filters, categories]);

  const updateFilters = (patch: Partial<TransactionFilters>) => setFilters((current) => ({ ...current, ...patch }));
  const resetPanelFilters = () => updateFilters({ query: "", categoryId: null, paymentType: null });
  const hasActiveFilters = view.activeFilterCount > 0 || filters.onlyUncategorized || filters.type !== "all";

  const selectDate = (dateKey: string) => {
    setSelectedDate(dateKey);
    setMobileView("list");
    window.setTimeout(() => document.getElementById(`day-${dateKey}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const goToCurrentMonth = () => {
    setPeriod(currentPeriod);
    setSelectedDate(todayKey);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="가계부"
        description="카드 명세서와 직접 입력한 내역을 날짜별로 확인하고 고쳐요."
        actions={
          <>
            <MonthSwitcher
              year={period.year}
              month={period.month}
              onPrev={() => setPeriod((value) => shiftMonth(value, -1))}
              onNext={() => setPeriod((value) => shiftMonth(value, 1))}
              nextDisabled={compareYearMonth(period, lastPeriod) >= 0}
              className="flex-1 sm:flex-none"
            />
            <Button size="lg" onClick={goToCurrentMonth} disabled={compareYearMonth(period, currentPeriod) === 0}>이번 달</Button>
            <Button size="lg" variant="primary" aria-label="내역 추가" onClick={() => setDetail({ open: true, transaction: null })} className="max-sm:px-3">
              <Plus size={18} strokeWidth={2} aria-hidden="true" />
              <span className="max-sm:hidden">내역 추가</span>
            </Button>
          </>
        }
      />

      <TransactionSummaryStrip month={period.month} totals={view.totals} />

      <SegmentedControl<MobileView>
        label="보기 방식"
        value={mobileView}
        onChange={setMobileView}
        stretch
        className="lg:hidden"
        options={[
          { value: "list", label: "목록" },
          { value: "calendar", label: "달력" },
        ]}
      />

      <div className="flex flex-wrap items-start gap-6">
        <div className={`flex min-w-0 flex-[4_1_360px] flex-col gap-6 ${mobileView === "list" ? "max-lg:hidden" : ""}`}>
          <TransactionCalendar year={period.year} month={period.month} dailyTotals={view.dailyTotals} selectedDate={selectedDate} todayKey={todayKey} onSelectDate={selectDate} />
          <PaymentBreakdownCard totals={view.paymentTotals} />
        </div>
        <TransactionListCard
          className={`flex-[7_1_520px] ${mobileView === "calendar" ? "max-lg:hidden" : ""}`}
          status={status}
          groups={view.groups}
          typeFilter={filters.type}
          typeCounts={view.typeCounts}
          onTypeChange={(type) => updateFilters({ type })}
          uncategorizedCount={view.uncategorizedCount}
          onlyUncategorized={filters.onlyUncategorized}
          onToggleUncategorized={() => updateFilters({ onlyUncategorized: !filters.onlyUncategorized })}
          filtersOpen={filtersOpen}
          onToggleFilters={() => setFiltersOpen((open) => !open)}
          activeFilterCount={view.activeFilterCount}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={() => setFilters(EMPTY_FILTERS)}
          filterPanelId={FILTER_PANEL_ID}
          filterPanel={<TransactionFilterPanel id={FILTER_PANEL_ID} categories={categories} filters={filters} onChange={updateFilters} onReset={resetPanelFilters} />}
          todayKey={todayKey}
          onSelect={(transaction) => setDetail({ open: true, transaction })}
          onRetry={reload}
        />
      </div>

      {/* 거래 상세 모달은 다음 단계에서 새 디자인으로 옮기기 전까지 이전 스타일을 쓴다. */}
      <div className="legacy-ui">
        <TransactionDetailModal
          open={detail.open}
          onClose={() => setDetail({ open: false, transaction: null })}
          transaction={detail.transaction}
          onSaved={reload}
          onDeleted={reload}
        />
      </div>
    </div>
  );
}
