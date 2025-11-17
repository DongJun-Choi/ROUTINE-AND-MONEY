"use client";

import { useMemo } from "react";

interface CalendarProps {
    year: number;
    month: number;
    dailyTotals: Record<string, { income: number; expense: number }>; // 변경!
    onSelectDate?: (date: string) => void;
    selectedDate?: string;
}

export default function Calendar({
    year,
    month,
    dailyTotals,
    onSelectDate,
    selectedDate,
}: CalendarProps) {

    const jsMonth = month - 1;

    const daysArray = useMemo(() => {
        const firstDay = new Date(year, jsMonth, 1);
        const lastDay = new Date(year, jsMonth + 1, 0);

        const startDayOfWeek = firstDay.getDay();
        const totalDays = lastDay.getDate();

        const calendarCells: {
            date: string | null;
            income: number;
            expense: number;
        }[] = [];

        // 빈칸 채우기
        for (let i = 0; i < startDayOfWeek; i++) {
            calendarCells.push({ date: null, income: 0, expense: 0 });
        }

        // 날짜 채우기
        for (let day = 1; day <= totalDays; day++) {
            const d = new Date(year, jsMonth, day);

            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            const key = `${yyyy}-${mm}-${dd}`;

            calendarCells.push({
                date: key,
                income: dailyTotals[key]?.income ?? 0,
                expense: dailyTotals[key]?.expense ?? 0,
            });
        }

        return calendarCells;
    }, [year, month, dailyTotals]);

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">
                📅 {year}년 {month}월 소비 달력
            </h2>

            {/* 요일 */}
            <div className="grid grid-cols-7 text-center text-gray-600 mb-2 font-semibold">
                <div>일</div><div>월</div><div>화</div>
                <div>수</div><div>목</div><div>금</div><div>토</div>
            </div>

            {/* 날짜 박스 */}
            <div className="grid grid-cols-7 gap-2">
                {daysArray.map((cell, idx) => (
                    <div
                        key={idx}
                        onClick={() => cell.date && onSelectDate?.(cell.date)}
                        className={`
                            min-h-[80px] border rounded-lg p-2 flex flex-col
                            ${cell.date ? "cursor-pointer bg-white hover:bg-gray-50" : "bg-gray-100"}
                            ${cell.date === selectedDate ? "ring-2 ring-blue-500" : ""}
                        `}
                    >
                        {/* 날짜 */}
                        <div className="text-sm font-bold text-gray-800">
                            {cell.date ? Number(cell.date.slice(8)) : ""}
                        </div>

                        {/* 지출 */}
                        {cell.date && cell.expense !== 0 && (
                            <div className="text-xs text-red-600 font-semibold mt-auto">
                                -{Math.abs(cell.expense).toLocaleString()}원
                            </div>
                        )}

                        {/* 수입 */}
                        {cell.date && cell.income !== 0 && (
                            <div className="text-xs text-blue-600 font-semibold">
                                +{cell.income.toLocaleString()}원
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
