import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { TemplatesList } from "@/components/TemplatesList";
import { DeleteTemplateButton } from "@/components/DeleteTemplateButton";

export default async function TemplatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Workout templates</h1>
        <TemplatesList templates={templates} />
      </div>
      {templates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 py-16 text-center">
          <p className="text-slate-400">No templates yet.</p>
          <p className="mt-2 text-sm text-slate-500">
            Create a template to quickly start workouts with a fixed set of exercises.
          </p>
          <TemplatesList templates={[]} />
        </div>
      ) : (
        <ul className="space-y-3">
          {templates.map((t) => (
            <li
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4"
            >
              <div>
                <h2 className="font-medium text-white">{t.name}</h2>
                <p className="text-sm text-slate-500">
                  {t.exercises.length} exercise{t.exercises.length !== 1 ? "s" : ""}
                  {t.exercises.length > 0 &&
                    ` · ${t.exercises.map((e) => e.exercise.name).join(", ")}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/workouts/new?templateId=${t.id}`}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
                >
                  Start workout
                </Link>
                <DeleteTemplateButton templateId={t.id} templateName={t.name} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
