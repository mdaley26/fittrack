import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { workoutSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
  const offset = Number(searchParams.get("offset")) || 0;

  const [workouts, total] = await Promise.all([
    prisma.workout.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: limit,
      skip: offset,
      include: {
        exercises: {
          include: { exercise: true, setRows: { orderBy: { setNumber: "asc" } } },
        },
      },
    }),
    prisma.workout.count({ where: { userId: user.id } }),
  ]);

  return NextResponse.json({ workouts, total });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { workout: workoutData, exercises: exercisesData } = body;

    const parsedWorkout = workoutSchema.safeParse(workoutData);
    if (!parsedWorkout.success) {
      return NextResponse.json(
        { error: parsedWorkout.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const workout = await prisma.workout.create({
      data: {
        userId: user.id,
        date: new Date(parsedWorkout.data.date),
        name: parsedWorkout.data.name ?? undefined,
        notes: parsedWorkout.data.notes ?? undefined,
      },
    });

    if (Array.isArray(exercisesData) && exercisesData.length > 0) {
      const { workoutExerciseSchema } = await import("@/lib/validations");
      for (const ex of exercisesData) {
        const parsed = workoutExerciseSchema.safeParse(ex);
        if (parsed.success) {
          const setRows = parsed.data.setRows ?? [];
          const aggSets = setRows.length;
          const aggWeight =
            aggSets > 0
              ? Math.max(...setRows.map((r) => r.weight ?? 0))
              : parsed.data.weight ?? undefined;
          const aggReps =
            aggSets > 0
              ? setRows.reduce((s, r) => s + (r.reps ?? 0), 0)
              : parsed.data.reps ?? undefined;
          const we = await prisma.workoutExercise.create({
            data: {
              workoutId: workout.id,
              exerciseId: parsed.data.exerciseId,
              sets: aggSets || (parsed.data.sets ?? undefined),
              reps: aggReps ?? parsed.data.reps ?? undefined,
              weight: aggWeight ?? parsed.data.weight ?? undefined,
              duration: parsed.data.duration ?? undefined,
              notes: parsed.data.notes ?? undefined,
            },
          });
          if (setRows.length) {
            await prisma.workoutSet.createMany({
              data: setRows.map((row) => ({
                workoutExerciseId: we.id,
                setNumber: row.setNumber,
                weight: row.weight ?? undefined,
                reps: row.reps ?? undefined,
              })),
            });
          }
        }
      }
    }

    const created = await prisma.workout.findUnique({
      where: { id: workout.id },
      include: {
        exercises: {
          include: { exercise: true, setRows: { orderBy: { setNumber: "asc" } } },
        },
      },
    });
    return NextResponse.json({ workout: created });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create workout" },
      { status: 500 }
    );
  }
}
