import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WorkoutForm } from "@/components/WorkoutForm";

export default async function NewWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ templateId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const params = await searchParams;
  const templateId = params.templateId ?? undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-white">
        {templateId ? "Start workout from template" : "Log workout"}
      </h1>
      <WorkoutForm
        weightUnit={(user.weightUnit as "kg" | "lb") ?? "kg"}
        templateId={templateId}
      />
    </div>
  );
}
