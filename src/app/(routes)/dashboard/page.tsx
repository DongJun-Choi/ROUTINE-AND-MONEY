"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import CategoryPie from "@/components/dashboard/CategoryPie";
import DailyChart from "@/components/dashboard/DailyChart";
import MonthlyChart from "@/components/dashboard/MonthlyChart";
import Summary from "@/components/dashboard/Summary";

export default function DashboardPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const stepMonth = (amount: number) => {
    const next = new Date(year, month - 1 + amount, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth() + 1);
  };

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <h1>대시보드</h1>
        <p>수입과 지출 흐름을 한눈에 확인하세요.</p>
      </div>

      <div className="dashboard-toolbar">
        <div className="view-tabs" aria-label="대시보드 보기">
          <span className="active">개요</span>
        </div>
        <div className="period-control">
          <button className="icon-button" onClick={() => stepMonth(-1)} aria-label="이전 달"><ChevronLeft size={17} /></button>
          <strong>{year}년 {month}월</strong>
          <button className="icon-button" onClick={() => stepMonth(1)} aria-label="다음 달"><ChevronRight size={17} /></button>
        </div>
      </div>

      <Summary year={year} month={month} />
      <div className="dashboard-grid">
        <section className="podo-panel dashboard-panel">
          <div className="panel-heading"><h2>카테고리별 지출</h2><span>{month}월 소비 비중</span></div>
          <div className="chart-wrap"><CategoryPie year={year} month={month} /></div>
        </section>
        <section className="podo-panel dashboard-panel">
          <div className="panel-heading"><h2>일별 지출 그래프</h2><span>{year}년 {month}월</span></div>
          <div className="chart-wrap"><DailyChart year={year} month={month} /></div>
        </section>
        <section className="podo-panel dashboard-panel full">
          <div className="panel-heading"><h2>월별 지출 추이</h2><span>{year}년 월별 흐름</span></div>
          <div className="chart-wrap"><MonthlyChart year={year} /></div>
        </section>
      </div>
    </div>
  );
}
