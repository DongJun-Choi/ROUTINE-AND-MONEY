"use client";

import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryPie({ year, month }: { year: number; month: number }) {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/dashboard/category?year=${year}&month=${month}`)
      .then((res) => res.json())
      .then((d) => setCategories(d));
  }, [year, month]);

  if (!categories.length) return <p>데이터 없음</p>;

  return (
    <Pie
      data={{
        labels: categories.map((c) => c.categoryName),
        datasets: [
          {
            data: categories.map((c) => c.amount),
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
            ],
          },
        ],
      }}
    />
  );
}
