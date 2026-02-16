import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Dashboard stats: recent workouts count, PRs, volume, etc.
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now);
  startOfMonth.setMonth(now.getMonth() - 1);

  const [workoutsThisWeek, workoutsThisMonth, totalWorkouts, recentWorkouts] =
    await Promise.all([
      prisma.workout.count({
        where: {
          userId: user.id,
          date: { gte: startOfWeek },
        },
      }),
      prisma.workout.count({
        where: {
          userId: user.id,
          date: { gte: startOfMonth },
        },
      }),
      prisma.workout.count({
        where: { userId: user.id },
      }),
      prisma.workout.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" },
        take: 5,
        include: {
          exercises: {
            include: { exercise: true },
          },
        },
      }),
    ]);

  return NextResponse.json({
    stats: {
      workoutsThisWeek,
      workoutsThisMonth,
      totalWorkouts,
    },
    recentWorkouts,
  });
}
