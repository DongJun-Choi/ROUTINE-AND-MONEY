"use client";

import { useState } from "react";
import SectionBox from "@/components/dashboard/SectionBox";
import Summary from "@/components/dashboard/Summary";
import CategoryPie from "@/components/dashboard/CategoryPie";
import DailyChart from "@/components/dashboard/DailyChart";

export default function DashboardPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

      {/* --- 연/월 선택 영역 --- */}
      <div className="flex gap-4 mb-6">
        <select
          className="border px-3 py-2 rounded-lg"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {[year, year - 1, year - 2].map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>

        <select
          className="border px-3 py-2 rounded-lg"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {[...Array(12)].map((_, i) => {
            const mm = i + 1;
            return <option key={mm} value={mm}>{mm}</option>;
          })}
        </select>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionBox title="📅 월 요약">
          <Summary year={year} month={month} />
        </SectionBox>

        <SectionBox title="🍩 카테고리별 지출">
          <div className="w-full h-[300px]">
            <CategoryPie year={year} month={month} />
          </div>
        </SectionBox>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 왼쪽: 그래프 */}
        <SectionBox title="📈 일별 지출 그래프">
          <div className="w-full h-[350px]">
            <DailyChart year={year} month={month} />
          </div>
        </SectionBox>

        {/* 오른쪽: 비워둠 (여백용) */}
        <div className="hidden md:block"></div>

      </div>
    </div>
  );
}