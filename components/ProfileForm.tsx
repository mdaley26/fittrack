"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  age: number | null;
  weight: number | null;
  height: number | null;
};

export function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [age, setAge] = useState(user.age ?? "");
  const [weight, setWeight] = useState(user.weight ?? "");
  const [height, setHeight] = useState(user.height ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError({});
    setSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          age: age === "" ? null : Number(age),
          weight: weight === "" ? null : Number(weight),
          height: height === "" ? null : Number(height),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || {});
        return;
      }
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        {error.name?.length ? (
          <p className="mt-1 text-sm text-red-400">{error.name[0]}</p>
        ) : null}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">
          Email
        </label>
        <p className="rounded-lg border border-slate-700 bg-slate-800/30 px-4 py-2.5 text-slate-400">
          {user.email}
        </p>
        <p className="mt-1 text-xs text-slate-500">Email cannot be changed.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Age
          </label>
          <input
            type="number"
            min={1}
            max={150}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Weight (kg)
          </label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Height (cm)
          </label>
          <input
            type="number"
            min={0}
            step={1}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-500 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
