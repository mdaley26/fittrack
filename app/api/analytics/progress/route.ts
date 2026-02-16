import { NextResponse } from "next/server";
import { requireSubscription } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Get progress over time for a specific exercise (for charts) — premium feature
export async function GET(req: Request) {
  const result = await requireSubscription();
  if ("response" in result) return result.response;
  const { user } = result;
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
      setRows: true,
    },
    orderBy: { workout: { date: "asc" } },
  });

  // One data point per workout (not merged by day), so each squat session shows separately
  const data = entries.map((e) => {
    const dateStr = e.workout.date.toISOString().slice(0, 10);
    let weight = 0;
    let reps = 0;
    let volume = 0;
    const setCount = e.setRows?.length ?? 0;
    if (setCount > 0 && e.setRows) {
      for (const row of e.setRows) {
        const w = row.weight ?? 0;
        const r = row.reps ?? 0;
        weight = Math.max(weight, w);
        reps += r;
        volume += w * r;
      }
    } else {
      weight = e.weight ?? 0;
      reps = (e.reps ?? 0) * (e.sets ?? 1);
      volume = weight * reps;
    }
    const sets = setCount || (e.sets ?? 1);
    return { date: dateStr, weight, reps, volume, sets };
  });
  const exerciseName = entries[0]?.exercise.name ?? "Exercise";

  return NextResponse.json({
    exerciseId,
    exerciseName,
    data,
  });
}
