"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function MonthlyChart({ year }: { year: number }) {
  const [data, setData] = useState<{ month: number; expense: number }[]>([]);

  useEffect(() => {
    fetch(`/api/dashboard/monthly?year=${year}`)
      .then((res) => res.json())
      .then((d) => setData(d));
  }, [year]);

  if (!data.length) return <p>데이터 없음</p>;

  return (
    <Line
      data={{
        labels: data.map((d) => `${d.month}월`),
        datasets: [
          {
            label: "월별 지출",
            data: data.map((d) => d.expense),
            borderColor: "#36A2EB",
            backgroundColor: "rgba(54,162,235,0.3)",
            tension: 0.25,
          },
        ],
      }}
    />
  );
}
