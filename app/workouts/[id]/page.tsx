import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { WorkoutForm } from "@/components/WorkoutForm";
import { ProgressChart } from "@/components/ProgressChart";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;

  const workout = await prisma.workout.findFirst({
    where: { id, userId: user.id },
    include: {
      exercises: {
        include: { exercise: true, setRows: { orderBy: { setNumber: "asc" } } },
      },
    },
  });
  if (!workout) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/workouts"
          className="text-slate-400 hover:text-white"
        >
          ← Workouts
        </Link>
      </div>
      <h1 className="mb-8 text-2xl font-bold text-white">
        {workout.name || "Workout"} –{" "}
        {new Date(workout.date).toLocaleDateString("en-US")}
      </h1>
      <WorkoutForm workout={workout} weightUnit={(user.weightUnit as "kg" | "lb") ?? "kg"} />
      {workout.exercises.length > 0 && (
        <div className="mt-12 space-y-8">
          {workout.exercises.map((we) => (
            <div key={we.id}>
              <h3 className="mb-2 font-medium text-white">{we.exercise.name}</h3>
              <ProgressChart exerciseId={we.exerciseId} exerciseName={we.exercise.name} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
