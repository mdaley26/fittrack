import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WorkoutForm } from "@/components/WorkoutForm";

export default async function NewWorkoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-white">Log workout</h1>
      <WorkoutForm weightUnit={(user.weightUnit as "kg" | "lb") ?? "kg"} />
    </div>
  );
}
