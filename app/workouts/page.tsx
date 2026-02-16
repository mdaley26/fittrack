import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function WorkoutsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workouts = await prisma.workout.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 100,
    include: {
      exercises: { include: { exercise: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Workouts</h1>
        <Link
          href="/workouts/new"
          className="rounded-lg bg-brand-600 px-4 py-2.5 font-medium text-white hover:bg-brand-500"
        >
          + New workout
        </Link>
      </div>

      {workouts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 py-16 text-center">
          <p className="text-slate-400">No workouts yet.</p>
          <Link
            href="/workouts/new"
            className="mt-4 inline-block text-brand-400 hover:underline"
          >
            Log your first workout
          </Link>
        </div>
      ) : (
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
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <span className="text-sm text-slate-400">
                    {w.exercises.length} exercise{w.exercises.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {w.exercises.slice(0, 4).map((e) => (
                    <span
                      key={e.id}
                      className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300"
                    >
                      {e.exercise.name}
                      {e.sets != null && e.reps != null && ` ${e.sets}×${e.reps}`}
                      {e.weight != null && ` @ ${e.weight}kg`}
                    </span>
                  ))}
                  {w.exercises.length > 4 && (
                    <span className="text-xs text-slate-500">
                      +{w.exercises.length - 4} more
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
