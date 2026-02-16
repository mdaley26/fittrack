import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { customExerciseSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const muscleGroup = searchParams.get("muscleGroup")?.trim() || "";
  const equipment = searchParams.get("equipment")?.trim() || "";

  const where: Record<string, unknown> = {};
  if (q) {
    where.name = { contains: q };
  }
  if (muscleGroup) where.muscleGroup = muscleGroup;
  if (equipment) where.equipment = equipment;

  const exercises = await prisma.exercise.findMany({
    where,
    orderBy: { name: "asc" },
    take: 200,
  });
  return NextResponse.json({ exercises });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = customExerciseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.exercise.findFirst({
      where: { name: parsed.data.name },
    });
    if (existing) {
      return NextResponse.json(
        { error: { name: ["An exercise with this name already exists"] } },
        { status: 400 }
      );
    }

    const exercise = await prisma.exercise.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? undefined,
        muscleGroup: parsed.data.muscleGroup ?? undefined,
        equipment: parsed.data.equipment ?? undefined,
      },
    });
    return NextResponse.json({ exercise });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create exercise" },
      { status: 500 }
    );
  }
}
