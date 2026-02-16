import Link from "next/link";

type Workout = {
  id: string;
  date: Date;
  name: string | null;
  notes: string | null;
  exercises: Array<{
    id: string;
    sets: number | null;
    reps: number | null;
    weight: number | null;
    duration: number | null;
    exercise: { name: string };
  }>;
};

export function RecentWorkouts({ workouts }: { workouts: Workout[] }) {
  return (
    <ul className="space-y-3">
      {workouts.map((w) => (
        <li key={w.id}>
          <Link
            href={`/workouts/${w.id}`}
            className="block rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-slate-700 hover:bg-slate-800/50"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-medium text-white">
                  {w.name || "Workout"}
                </span>
                <span className="ml-2 text-slate-500">
                  {new Date(w.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <span className="text-sm text-slate-400">
                {w.exercises.length} exercise{w.exercises.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {w.exercises.slice(0, 3).map((e) => (
                <span
                  key={e.id}
                  className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300"
                >
                  {e.exercise.name}
                  {e.sets != null && e.reps != null && ` ${e.sets}×${e.reps}`}
                  {e.weight != null && ` @ ${e.weight}kg`}
                </span>
              ))}
              {w.exercises.length > 3 && (
                <span className="text-xs text-slate-500">
                  +{w.exercises.length - 3} more
                </span>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
