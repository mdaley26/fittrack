"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Exercise = { id: string; name: string; muscleGroup: string | null; equipment: string | null };

export function CreateTemplateModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<
    Array<{ exerciseId: string; exerciseName: string; defaultSets: number }>
  >([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !search.trim()) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/exercises?q=${encodeURIComponent(search.trim())}`);
      const data = await res.json();
      setSearchResults(data.exercises ?? []);
    }, 200);
    return () => clearTimeout(t);
  }, [open, search]);

  function addExercise(ex: Exercise) {
    if (exercises.some((e) => e.exerciseId === ex.id)) return;
    setExercises((prev) => [...prev, { exerciseId: ex.id, exerciseName: ex.name, defaultSets: 1 }]);
    setSearch("");
    setSearchResults([]);
  }

  function removeExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function setDefaultSets(index: number, value: number) {
    setExercises((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], defaultSets: Math.max(1, Math.min(20, value)) };
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (exercises.length === 0) {
      setError("Add at least one exercise");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          exercises: exercises.map((ex) => ({ exerciseId: ex.exerciseId, defaultSets: ex.defaultSets })),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || "Failed to create template");
        return;
      }
      onClose();
      router.refresh();
      setName("");
      setExercises([]);
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-white">Create template</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded bg-red-900/30 px-3 py-2 text-sm text-red-400">{error}</p>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Template name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Leg Day"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Add exercises</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercises..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            {searchResults.length > 0 && (
              <ul className="mt-1 max-h-40 overflow-auto rounded border border-slate-700 bg-slate-800">
                {searchResults.map((ex) => (
                  <li key={ex.id}>
                    <button
                      type="button"
                      onClick={() => addExercise(ex)}
                      className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700"
                    >
                      {ex.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-1 text-xs text-slate-500">
              <Link href="/exercises" className="text-brand-400 hover:underline">
                Add custom exercise
              </Link>
            </p>
          </div>
          {exercises.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Exercises</label>
              <ul className="space-y-2">
                {exercises.map((ex, i) => (
                  <li
                    key={ex.exerciseId}
                    className="flex items-center justify-between rounded border border-slate-700 bg-slate-800/50 px-3 py-2"
                  >
                    <span className="text-sm text-white">{ex.exerciseName}</span>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-500">Sets:</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={ex.defaultSets}
                        onChange={(e) => setDefaultSets(i, parseInt(e.target.value, 10) || 1)}
                        className="w-14 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeExercise(i)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-600 px-4 py-2.5 font-medium text-white hover:bg-brand-500 disabled:opacity-50"
            >
              {saving ? "Creating…" : "Create template"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-600 px-4 py-2.5 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
