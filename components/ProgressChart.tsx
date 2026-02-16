"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      grid: { color: "rgba(51, 65, 85, 0.5)" },
      ticks: { color: "#94a3b8" },
    },
    y: {
      grid: { color: "rgba(51, 65, 85, 0.5)" },
      ticks: { color: "#94a3b8" },
    },
  },
};

type DataPoint = {
  date: string;
  weight: number;
  reps: number;
  volume: number;
  sets: number;
};

export function ProgressChart({
  exerciseId,
  exerciseName,
}: {
  exerciseId: string;
  exerciseName: string;
}) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analytics/progress?exerciseId=${encodeURIComponent(exerciseId)}`)
      .then((r) => r.json())
      .then((res) => {
        setData(res.data ?? []);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [exerciseId]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading chart…</p>;
  }
  if (data.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Not enough data yet. Log more workouts with this exercise to see progress.
      </p>
    );
  }

  const labels = data.map((d) => {
    const dte = new Date(d.date);
    return dte.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });
  const weightData = data.map((d) => d.weight);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Max weight (kg)",
        data: weightData,
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.15)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="h-[280px] w-full">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}
