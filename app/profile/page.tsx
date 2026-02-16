import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-white">Profile</h1>
      <ProfileForm user={user} />
    </div>
  );
}
