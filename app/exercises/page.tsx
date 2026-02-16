import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ExerciseList } from "@/components/ExerciseList";
import { AddExerciseForm } from "@/components/AddExerciseForm";

export default async function ExercisesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const exercises = await prisma.exercise.findMany({
    orderBy: { name: "asc" },
    take: 500,
  });

  const muscleGroups = Array.from(
    new Set(exercises.map((e) => e.muscleGroup).filter(Boolean))
  ).sort() as string[];
  const equipmentList = Array.from(
    new Set(exercises.map((e) => e.equipment).filter(Boolean))
  ).sort() as string[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Exercise library</h1>
        <AddExerciseForm />
      </div>
      <ExerciseList
        exercises={exercises}
        muscleGroups={muscleGroups}
        equipmentList={equipmentList}
      />
    </div>
  );
}
