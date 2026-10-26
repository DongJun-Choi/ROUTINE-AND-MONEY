"use client";

import Link from "next/link";
import { Upload } from "lucide-react";
import { useMemo, useState } from "react";
import CategoryBreakdownCard from "@/components/dashboard/CategoryBreakdownCard";
import DailySpendingCard from "@/components/dashboard/DailySpendingCard";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import MonthlyTrendCard from "@/components/dashboard/MonthlyTrendCard";
import RecentTransactionsCard from "@/components/dashboard/RecentTransactionsCard";
import SummaryCards from "@/components/dashboard/SummaryCards";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import Button, { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import MonthSwitcher from "@/components/ui/MonthSwitcher";
import PageHeader from "@/components/ui/PageHeader";
import { buildDashboardView } from "@/lib/dashboard/stats";
import { compareYearMonth, shiftMonth, type YearMonth } from "@/lib/date";
import { formatNumber } from "@/lib/format";

export default function DashboardPage() {
  const [today] = useState(() => new Date());
  const currentPeriod: YearMonth = { year: today.getFullYear(), month: today.getMonth() + 1 };
  const [period, setPeriod] = useState<YearMonth>(currentPeriod);
  const { status, loaded, reload } = useDashboardData(period);

  const view = useMemo(() => (loaded ? buildDashboardView(loaded.data, loaded.period, today) : null), [loaded, today]);
  const shownPeriod = loaded?.period ?? period;
  const isCurrentMonth = compareYearMonth(period, currentPeriod) === 0;
  const isShowingCurrentMonth = compareYearMonth(shownPeriod, currentPeriod) === 0;

  const description =
    status === "error" ? "데이터를 불러오지 못했어요."
      : status === "loading" || !view ? `${period.month}월 내역을 불러오는 중이에요.`
        : view.transactionCount > 0 ? `${period.month}월 카드 사용 흐름이에요. 거래 ${formatNumber(view.transactionCount)}건이 반영되어 있어요.`
          : `${period.month}월에는 반영된 거래가 없어요.`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="대시보드"
        description={description}
        actions={
          <>
            <MonthSwitcher
              year={period.year}
              month={period.month}
              onPrev={() => setPeriod((value) => shiftMonth(value, -1))}
              onNext={() => setPeriod((value) => shiftMonth(value, 1))}
              className="flex-1 sm:flex-none"
            />
            <Button size="lg" onClick={() => setPeriod(currentPeriod)} disabled={isCurrentMonth}>이번 달</Button>
            <Link href="/upload" className={buttonStyles({ variant: "primary", size: "lg", className: "max-lg:hidden" })}>
              <Upload size={18} strokeWidth={2} aria-hidden="true" />
              명세서 가져오기
            </Link>
          </>
        }
      />

      {status === "error" && (
        <Card role="alert" className="flex-row flex-wrap items-center justify-between gap-3 border-danger-line bg-danger-soft">
          <p className="m-0 text-sm font-medium text-danger">대시보드 데이터를 불러오지 못했어요. 데이터베이스가 켜져 있는지 확인한 뒤 다시 시도해 주세요.</p>
          <Button onClick={reload}>다시 시도</Button>
        </Card>
      )}

      {!view ? (
        status === "loading" && <DashboardSkeleton />
      ) : (
        <div className={`flex flex-col gap-6 transition-opacity ${status === "loading" ? "opacity-60" : ""}`} aria-busy={status === "loading"}>
          <SummaryCards month={shownPeriod.month} view={view} />
          <div className="flex flex-wrap gap-6">
            <MonthlyTrendCard className="flex-[7_1_560px]" yearSeries={view.yearSeries} recentSeries={view.recentSeries} />
            <CategoryBreakdownCard className="flex-[5_1_380px]" month={shownPeriod.month} groups={view.categoryGroups} total={view.categoryTotal} insight={view.categoryInsight} />
          </div>
          <div className="flex flex-wrap gap-6">
            <DailySpendingCard className="flex-[7_1_560px]" period={shownPeriod} daily={view.daily} isCurrentMonth={isShowingCurrentMonth} />
            <RecentTransactionsCard className="flex-[5_1_380px]" transactions={view.recentTransactions} />
          </div>
        </div>
      )}
    </div>
  );
}
