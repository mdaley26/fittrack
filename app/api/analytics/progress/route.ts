import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Get progress over time for a specific exercise (for charts)
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const exerciseId = searchParams.get("exerciseId");
  if (!exerciseId) {
    return NextResponse.json(
      { error: "exerciseId is required" },
      { status: 400 }
    );
  }

  const entries = await prisma.workoutExercise.findMany({
    where: {
      exerciseId,
      workout: { userId: user.id },
    },
    include: {
      workout: { select: { date: true } },
      exercise: { select: { name: true } },
    },
    orderBy: { workout: { date: "asc" } },
  });

  const byDate = new Map<
    string,
    { date: string; weight: number; reps: number; volume: number; sets: number }
  >();
  for (const e of entries) {
    const dateStr = e.workout.date.toISOString().slice(0, 10);
    const weight = e.weight ?? 0;
    const reps = e.reps ?? 0;
    const sets = e.sets ?? 1;
    const volume = weight * reps * sets;
    const existing = byDate.get(dateStr);
    if (existing) {
      existing.weight = Math.max(existing.weight, weight);
      existing.reps += reps * sets;
      existing.volume += volume;
      existing.sets += sets;
    } else {
      byDate.set(dateStr, {
        date: dateStr,
        weight: weight,
        reps: reps * sets,
        volume,
        sets,
      });
    }
  }

  const data = Array.from(byDate.values()).sort(
    (a, b) => a.date.localeCompare(b.date)
  );
  const exerciseName = entries[0]?.exercise.name ?? "Exercise";

  return NextResponse.json({
    exerciseId,
    exerciseName,
    data,
  });
}
