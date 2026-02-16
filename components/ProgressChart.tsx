"use client";

import { useEffect, useState } from "react";

function UpgradeCTA() {
  const [loading, setLoading] = useState(false);
  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  };
  return (
    <button
      type="button"
      onClick={handleUpgrade}
      disabled={loading}
      className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-amber-400 disabled:opacity-70"
    >
      {loading ? "…" : "Upgrade to Pro"}
    </button>
  );
}
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
  const [needsUpgrade, setNeedsUpgrade] = useState(false);

  useEffect(() => {
    fetch(`/api/analytics/progress?exerciseId=${encodeURIComponent(exerciseId)}`)
      .then((r) => {
        if (r.status === 402) {
          setNeedsUpgrade(true);
          return { data: [] };
        }
        return r.json();
      })
      .then((res) => {
        setData(res.data ?? []);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [exerciseId]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading chart…</p>;
  }
  if (needsUpgrade) {
    return (
      <div className="rounded-xl border border-amber-800 bg-amber-900/20 p-6 text-center">
        <p className="mb-3 text-sm text-amber-200">
          Progress charts are a FitTrack Pro feature.
        </p>
        <UpgradeCTA />
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Not enough data yet. Log more workouts with this exercise to see progress.
      </p>
    );
  }

  // Unique labels for x-axis (same-day workouts get "Feb 16 (1)", "Feb 16 (2)")
  const dateCount = new Map<string, number>();
  const labels = data.map((d) => {
    const dte = new Date(d.date);
    const base = dte.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const n = (dateCount.get(d.date) ?? 0) + 1;
    dateCount.set(d.date, n);
    return n > 1 ? `${base} (${n})` : base;
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
