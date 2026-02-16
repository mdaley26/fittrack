import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { workoutSchema } from "@/lib/validations";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const workout = await prisma.workout.findFirst({
    where: { id, userId: user.id },
    include: {
      exercises: {
        include: { exercise: true, setRows: { orderBy: { setNumber: "asc" } } },
      },
    },
  });
  if (!workout) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 });
  }
  return NextResponse.json({ workout });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.workout.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { workout: workoutData, exercises: exercisesData } = body;

    if (workoutData) {
      const parsed = workoutSchema.safeParse(workoutData);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      await prisma.workout.update({
        where: { id },
        data: {
          date: new Date(parsed.data.date),
          name: parsed.data.name ?? undefined,
          notes: parsed.data.notes ?? undefined,
        },
      });
    }

    if (Array.isArray(exercisesData)) {
      await prisma.workoutExercise.deleteMany({ where: { workoutId: id } });
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
              workoutId: id,
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

    const updated = await prisma.workout.findUnique({
      where: { id },
      include: {
        exercises: {
          include: { exercise: true, setRows: { orderBy: { setNumber: "asc" } } },
        },
      },
    });
    return NextResponse.json({ workout: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update workout" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.workout.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 });
  }

  await prisma.workout.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
