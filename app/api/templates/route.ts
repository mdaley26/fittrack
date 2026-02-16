import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  exercises: z.array(
    z.object({
      exerciseId: z.string().uuid(),
      defaultSets: z.coerce.number().int().min(1).max(20).optional().default(1),
    })
  ),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templates = await prisma.workoutTemplate.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      exercises: {
        orderBy: { orderIndex: "asc" },
        include: { exercise: true },
      },
    },
  });
  return NextResponse.json({ templates });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = createTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const template = await prisma.workoutTemplate.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        exercises: {
          create: parsed.data.exercises.map((ex, i) => ({
            exerciseId: ex.exerciseId,
            orderIndex: i,
            defaultSets: ex.defaultSets ?? 1,
          })),
        },
      },
      include: {
        exercises: {
          orderBy: { orderIndex: "asc" },
          include: { exercise: true },
        },
      },
    });
    return NextResponse.json({ template });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
