export function DashboardStats({
  workoutsThisWeek,
  totalWorkouts,
}: {
  workoutsThisWeek: number;
  totalWorkouts: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <p className="text-sm font-medium text-slate-400">This week</p>
        <p className="mt-1 text-3xl font-bold text-white">{workoutsThisWeek}</p>
        <p className="text-sm text-slate-500">workouts</p>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <p className="text-sm font-medium text-slate-400">Total workouts</p>
        <p className="mt-1 text-3xl font-bold text-white">{totalWorkouts}</p>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <p className="text-sm font-medium text-slate-400">Progress</p>
        <p className="mt-1 text-lg text-slate-300">
          {totalWorkouts > 0
            ? "Keep it up! View trends in Exercises → select exercise → Progress."
            : "Log a workout to see analytics."}
        </p>
      </div>
    </div>
  );
}
