import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET last workout's sets for this exercise (for "previous" column when logging)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: exerciseId } = await params;
  const { searchParams } = new URL(req.url);
  const excludeWorkoutId = searchParams.get("excludeWorkoutId") ?? undefined;

  const lastWe = await prisma.workoutExercise.findFirst({
    where: {
      exerciseId,
      workout: {
        userId: user.id,
        ...(excludeWorkoutId ? { id: { not: excludeWorkoutId } } : {}),
      },
      setRows: { some: {} },
    },
    orderBy: { workout: { date: "desc" } },
    include: {
      setRows: { orderBy: { setNumber: "asc" } },
    },
  });

  if (!lastWe?.setRows?.length) {
    // Fallback: legacy single set from aggregate
    const legacy = await prisma.workoutExercise.findFirst({
      where: {
        exerciseId,
        workout: {
          userId: user.id,
          ...(excludeWorkoutId ? { id: { not: excludeWorkoutId } } : {}),
        },
        OR: [
          { weight: { not: null } },
          { reps: { not: null } },
        ],
      },
      orderBy: { workout: { date: "desc" } },
    });
    if (legacy && (legacy.weight != null || legacy.reps != null)) {
      const n = legacy.sets ?? 1;
      const rows = Array.from({ length: n }, (_, i) => ({
        setNumber: i + 1,
        weight: legacy.weight,
        reps: legacy.reps,
      }));
      return NextResponse.json({ sets: rows });
    }
    return NextResponse.json({ sets: [] });
  }

  return NextResponse.json({
    sets: lastWe.setRows.map((s) => ({
      setNumber: s.setNumber,
      weight: s.weight,
      reps: s.reps,
    })),
  });
}
