"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Exercise = { id: string; name: string; muscleGroup: string | null; equipment: string | null };
type WorkoutExercise = {
  id: string;
  exerciseId: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  duration: number | null;
  notes: string | null;
  exercise: Exercise;
};
type Workout = {
  id: string;
  date: Date;
  name: string | null;
  notes: string | null;
  exercises: WorkoutExercise[];
};

export function WorkoutForm({ workout }: { workout?: Workout }) {
  const router = useRouter();
  const isEdit = !!workout;
  const [name, setName] = useState(workout?.name ?? "");
  const [date, setDate] = useState(
    workout
      ? new Date(workout.date).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [notes, setNotes] = useState(workout?.notes ?? "");
  const [exercises, setExercises] = useState<
    Array<{
      exerciseId: string;
      exerciseName: string;
      sets: number | null;
      reps: number | null;
      weight: number | null;
      duration: number | null;
      notes: string | null;
    }>
  >(
    workout?.exercises.map((e) => ({
      exerciseId: e.exerciseId,
      exerciseName: e.exercise.name,
      sets: e.sets,
      reps: e.reps,
      weight: e.weight,
      duration: e.duration,
      notes: e.notes,
    })) ?? []
  );
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [exerciseResults, setExerciseResults] = useState<Exercise[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!exerciseSearch.trim()) {
      setExerciseResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/exercises?q=${encodeURIComponent(exerciseSearch.trim())}`
        );
        const data = await res.json();
        setExerciseResults(data.exercises ?? []);
      } catch {
        setExerciseResults([]);
      } finally {
        setSearching(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [exerciseSearch]);

  function addExercise(ex: Exercise) {
    if (exercises.some((e) => e.exerciseId === ex.id)) return;
    setExercises((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: null,
        reps: null,
        weight: null,
        duration: null,
        notes: null,
      },
    ]);
    setExerciseSearch("");
    setExerciseResults([]);
  }

  function updateExercise(
    index: number,
    field: "sets" | "reps" | "weight" | "duration" | "notes",
    value: number | string | null
  ) {
    setExercises((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function removeExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        workout: {
          date: new Date(date).toISOString().slice(0, 10),
          name: name.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        exercises: exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets ?? undefined,
          reps: ex.reps ?? undefined,
          weight: ex.weight ?? undefined,
          duration: ex.duration ?? undefined,
          notes: ex.notes ?? undefined,
        })),
      };
      const url = isEdit ? `/api/workouts/${workout.id}` : "/api/workouts";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || "Failed to save");
        return;
      }
      const data = await res.json();
      router.push(`/workouts/${data.workout?.id ?? workout?.id}`);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!isEdit || !confirm("Delete this workout?")) return;
    const res = await fetch(`/api/workouts/${workout.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/workouts");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded-lg bg-red-900/30 px-4 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Date & time
          </label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Workout name (optional)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Leg Day"
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">
          Add exercise
        </label>
        <div className="relative">
          <input
            type="text"
            value={exerciseSearch}
            onChange={(e) => setExerciseSearch(e.target.value)}
            placeholder="Search exercises..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          {exerciseResults.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-700 bg-slate-800 py-1 shadow-xl">
              {exerciseResults.map((ex) => (
                <li key={ex.id}>
                  <button
                    type="button"
                    onClick={() => addExercise(ex)}
                    className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700"
                  >
                    {ex.name}
                    {(ex.muscleGroup || ex.equipment) && (
                      <span className="ml-2 text-slate-500">
                        {[ex.muscleGroup, ex.equipment].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {searching && (
            <p className="mt-1 text-sm text-slate-500">Searching...</p>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Can’t find one?{" "}
          <Link href="/exercises" className="text-brand-400 hover:underline">
            Add a custom exercise
          </Link>
        </p>
      </div>

      {exercises.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-white">Exercises</h3>
          <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            {exercises.map((ex, i) => (
              <div
                key={`${ex.exerciseId}-${i}`}
                className="rounded-lg border border-slate-700 bg-slate-800/30 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-medium text-white">{ex.exerciseName}</span>
                  <button
                    type="button"
                    onClick={() => removeExercise(i)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-0.5 block text-xs text-slate-500">Sets</label>
                    <input
                      type="number"
                      min={0}
                      value={ex.sets ?? ""}
                      onChange={(e) =>
                        updateExercise(
                          i,
                          "sets",
                          e.target.value === "" ? null : parseInt(e.target.value, 10)
                        )
                      }
                      className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-xs text-slate-500">Reps</label>
                    <input
                      type="number"
                      min={0}
                      value={ex.reps ?? ""}
                      onChange={(e) =>
                        updateExercise(
                          i,
                          "reps",
                          e.target.value === "" ? null : parseInt(e.target.value, 10)
                        )
                      }
                      className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-xs text-slate-500">Weight (kg)</label>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={ex.weight ?? ""}
                      onChange={(e) =>
                        updateExercise(
                          i,
                          "weight",
                          e.target.value === "" ? null : parseFloat(e.target.value)
                        )
                      }
                      className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-xs text-slate-500">Duration (sec)</label>
                    <input
                      type="number"
                      min={0}
                      value={ex.duration ?? ""}
                      onChange={(e) =>
                        updateExercise(
                          i,
                          "duration",
                          e.target.value === "" ? null : parseInt(e.target.value, 10)
                        )
                      }
                      className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-white"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="mb-0.5 block text-xs text-slate-500">Notes</label>
                  <input
                    type="text"
                    value={ex.notes ?? ""}
                    onChange={(e) => updateExercise(i, "notes", e.target.value || null)}
                    placeholder="Optional"
                    className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-white placeholder-slate-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">
          Workout notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="How did it feel? Any adjustments?"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-500 disabled:opacity-50"
        >
          {saving ? "Saving…" : isEdit ? "Update workout" : "Save workout"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg border border-red-800 bg-red-900/20 px-5 py-2.5 font-medium text-red-400 hover:bg-red-900/30"
          >
            Delete workout
          </button>
        )}
      </div>
    </form>
  );
}
