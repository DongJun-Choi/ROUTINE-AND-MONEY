"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function DailyChart({ year, month }: { year: number; month: number }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/dashboard/daily?year=${year}&month=${month}`)
      .then((res) => res.json())
      .then((d) => setData(d));
  }, [year, month]);

  if (!data.length) return <p>데이터 없음</p>;

  return (
    <Line
      data={{
        labels: data.map((d) => d.date),
        datasets: [
          {
            label: "지출",
            data: data.map((d) => d.expense),
            borderColor: "#FF6384",
            backgroundColor: "rgba(255,99,132,0.3)",
            tension: 0.2,
          },
        ],
      }}
    />
  );
}
