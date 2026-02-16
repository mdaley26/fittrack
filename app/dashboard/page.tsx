import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DashboardStats } from "@/components/DashboardStats";
import { RecentWorkouts } from "@/components/RecentWorkouts";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);

  const [workoutsThisWeek, totalWorkouts, recentWorkouts] = await Promise.all([
    prisma.workout.count({
      where: { userId: user.id, date: { gte: startOfWeek } },
    }),
    prisma.workout.count({ where: { userId: user.id } }),
    prisma.workout.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 5,
      include: {
        exercises: { include: { exercise: true } },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">
          Hey, {user.name.split(" ")[0]} 👋
        </h1>
        <Link
          href="/workouts/new"
          className="rounded-lg bg-brand-600 px-4 py-2.5 font-medium text-white hover:bg-brand-500"
        >
          + Log workout
        </Link>
      </div>

      <DashboardStats
        workoutsThisWeek={workoutsThisWeek}
        totalWorkouts={totalWorkouts}
      />

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-white">Recent workouts</h2>
        <RecentWorkouts workouts={recentWorkouts} />
        {recentWorkouts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 py-12 text-center text-slate-400">
            No workouts yet.{" "}
            <Link href="/workouts/new" className="text-brand-400 hover:underline">
              Log your first workout
            </Link>
          </p>
        ) : (
          <Link
            href="/workouts"
            className="mt-4 inline-block text-sm text-brand-400 hover:underline"
          >
            View all workouts →
          </Link>
        )}
      </section>
    </div>
  );
}
