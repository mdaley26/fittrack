import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center">
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
        Track your workouts.
        <br />
        <span className="text-brand-400">See your progress.</span>
      </h1>
      <p className="mb-10 text-lg text-slate-400">
        Log exercises, monitor performance over time, and hit your fitness goals
        with FitTrack.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/register"
          className="rounded-xl bg-brand-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-500"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-xl border border-slate-600 bg-slate-800/50 px-8 py-4 text-lg font-semibold text-slate-200 transition hover:bg-slate-800"
        >
          Log in
        </Link>
      </div>
      <div className="mt-20 grid gap-8 text-left sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="mb-3 text-2xl">📋</div>
          <h3 className="mb-2 font-semibold text-white">Log workouts</h3>
          <p className="text-sm text-slate-400">
            Add exercises with sets, reps, weight, and duration. Keep notes for
            each session.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="mb-3 text-2xl">📈</div>
          <h3 className="mb-2 font-semibold text-white">Track progress</h3>
          <p className="text-sm text-slate-400">
            View trends and personal records. See volume and strength over time
            with simple charts.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="mb-3 text-2xl">🏋️</div>
          <h3 className="mb-2 font-semibold text-white">Exercise library</h3>
          <p className="text-sm text-slate-400">
            Browse exercises by muscle group and equipment. Add custom exercises
            anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
