"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const KG_TO_LB = 2.205;

type Exercise = { id: string; name: string; muscleGroup: string | null; equipment: string | null };
type SetRow = { setNumber: number; weight: number | null; reps: number | null };
type WorkoutSetRow = { id?: string; setNumber: number; weight: number | null; reps: number | null };
type WorkoutExercise = {
  id: string;
  exerciseId: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  duration: number | null;
  notes: string | null;
  exercise: Exercise;
  setRows: WorkoutSetRow[];
};
type Workout = {
  id: string;
  date: Date;
  name: string | null;
  notes: string | null;
  exercises: WorkoutExercise[];
};

type ExerciseState = {
  exerciseId: string;
  exerciseName: string;
  duration: number | null;
  notes: string | null;
  setRows: Array<{ setNumber: number; weight: number | null; reps: number | null }>;
  previousSets: SetRow[]; // last time's sets for "Previous" column
};

function displayWeight(kg: number | null, unit: "kg" | "lb"): string {
  if (kg == null) return "";
  return unit === "lb" ? (kg * KG_TO_LB).toFixed(1) : String(kg);
}

function inputToKg(value: string, unit: "kg" | "lb"): number | null {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return null;
  return unit === "lb" ? n / KG_TO_LB : n;
}

export function WorkoutForm({
  workout,
  weightUnit = "kg",
}: {
  workout?: Workout;
  weightUnit?: "kg" | "lb";
}) {
  const router = useRouter();
  const isEdit = !!workout;
  const [name, setName] = useState(workout?.name ?? "");
  const [date, setDate] = useState(
    workout
      ? new Date(workout.date).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [notes, setNotes] = useState(workout?.notes ?? "");
  const [exercises, setExercises] = useState<ExerciseState[]>(
    workout?.exercises.map((e) => {
      if (e.setRows?.length) {
        return {
          exerciseId: e.exerciseId,
          exerciseName: e.exercise.name,
          duration: e.duration,
          notes: e.notes,
          setRows: e.setRows.map((s) => ({
            setNumber: s.setNumber,
            weight: s.weight,
            reps: s.reps,
          })),
          previousSets: [],
        };
      }
      const n = e.sets ?? 1;
      return {
        exerciseId: e.exerciseId,
        exerciseName: e.exercise.name,
        duration: e.duration,
        notes: e.notes,
        setRows: Array.from({ length: n }, (_, i) => ({
          setNumber: i + 1,
          weight: e.weight,
          reps: e.reps,
        })),
        previousSets: [],
      };
    }) ?? []
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

  // When editing, fetch previous sets for each exercise so "Previous" column shows
  useEffect(() => {
    if (!isEdit || !workout || exercises.length === 0) return;
    let cancelled = false;
    exercises.forEach((ex, i) => {
      if (ex.previousSets.length > 0) return;
      fetch(
        `/api/exercises/${ex.exerciseId}/previous-sets?excludeWorkoutId=${encodeURIComponent(workout.id)}`
      )
        .then((r) => r.json())
        .then((data) => {
          if (cancelled || !data.sets?.length) return;
          setExercises((prev) => {
            const next = [...prev];
            if (next[i].exerciseId !== ex.exerciseId) return prev;
            next[i] = { ...next[i], previousSets: data.sets };
            return next;
          });
        })
        .catch(() => {});
    });
    return () => {
      cancelled = true;
    };
  }, [isEdit, workout?.id]);

  async function addExercise(ex: Exercise) {
    if (exercises.some((e) => e.exerciseId === ex.id)) return;
    let setRows: ExerciseState["setRows"] = [{ setNumber: 1, weight: null, reps: null }];
    let previousSets: SetRow[] = [];
    try {
      const url = isEdit && workout
        ? `/api/exercises/${ex.id}/previous-sets?excludeWorkoutId=${encodeURIComponent(workout.id)}`
        : `/api/exercises/${ex.id}/previous-sets`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.sets?.length) {
        previousSets = data.sets;
        setRows = data.sets.map((s: SetRow) => ({
          setNumber: s.setNumber,
          weight: s.weight,
          reps: s.reps,
        }));
      }
    } catch {
      // keep default 1 row
    }
    setExercises((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        exerciseName: ex.name,
        duration: null,
        notes: null,
        setRows,
        previousSets,
      },
    ]);
    setExerciseSearch("");
    setExerciseResults([]);
  }

  function addSet(exIndex: number) {
    setExercises((prev) => {
      const next = [...prev];
      const ex = next[exIndex];
      const nextNum = ex.setRows.length + 1;
      next[exIndex] = {
        ...ex,
        setRows: [...ex.setRows, { setNumber: nextNum, weight: null, reps: null }],
        previousSets: ex.previousSets,
      };
      return next;
    });
  }

  function removeSet(exIndex: number, setIndex: number) {
    setExercises((prev) => {
      const next = [...prev];
      const ex = next[exIndex];
      const newRows = ex.setRows
        .filter((_, i) => i !== setIndex)
        .map((r, i) => ({ ...r, setNumber: i + 1 }));
      next[exIndex] = { ...ex, setRows: newRows };
      return next;
    });
  }

  function updateSet(
    exIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: number | null
  ) {
    setExercises((prev) => {
      const next = [...prev];
      const row = { ...next[exIndex].setRows[setIndex], [field]: value };
      next[exIndex].setRows = [...next[exIndex].setRows];
      next[exIndex].setRows[setIndex] = row;
      return next;
    });
  }

  function updateExercise(
    exIndex: number,
    field: "duration" | "notes",
    value: number | string | null
  ) {
    setExercises((prev) => {
      const next = [...prev];
      next[exIndex] = { ...next[exIndex], [field]: value };
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
          duration: ex.duration ?? undefined,
          notes: ex.notes ?? undefined,
          setRows: ex.setRows.map((r) => ({
            setNumber: r.setNumber,
            weight: r.weight ?? undefined,
            reps: r.reps ?? undefined,
          })),
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

  const unitLabel = weightUnit === "lb" ? "lb" : "kg";

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
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[400px] text-sm">
                    <thead>
                      <tr className="border-b border-slate-600 text-left text-slate-400">
                        <th className="py-2 pr-3 font-medium">Set</th>
                        <th className="py-2 pr-3 font-medium">Previous</th>
                        <th className="py-2 pr-3 font-medium">Weight ({unitLabel})</th>
                        <th className="py-2 pr-3 font-medium">Reps</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ex.setRows.map((row, setIdx) => (
                        <tr key={setIdx} className="border-b border-slate-700/50">
                          <td className="py-2 pr-3 text-slate-300">{row.setNumber}</td>
                          <td className="py-2 pr-3 text-slate-500">
                            {(() => {
                              const prev = ex.previousSets[setIdx];
                              if (!prev || (prev.weight == null && prev.reps == null))
                                return "—";
                              return `${displayWeight(prev.weight, weightUnit)} ${unitLabel} × ${prev.reps ?? "—"} reps`;
                            })()}
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              type="number"
                              min={0}
                              step={weightUnit === "lb" ? 2.5 : 0.5}
                              value={displayWeight(row.weight, weightUnit)}
                              onChange={(e) =>
                                updateSet(
                                  i,
                                  setIdx,
                                  "weight",
                                  inputToKg(e.target.value, weightUnit)
                                )
                              }
                              className="w-20 rounded border border-slate-600 bg-slate-800 px-2 py-1.5 text-white"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              type="number"
                              min={0}
                              value={row.reps ?? ""}
                              onChange={(e) =>
                                updateSet(
                                  i,
                                  setIdx,
                                  "reps",
                                  e.target.value === ""
                                    ? null
                                    : parseInt(e.target.value, 10)
                                )
                              }
                              className="w-16 rounded border border-slate-600 bg-slate-800 px-2 py-1.5 text-white"
                            />
                          </td>
                          <td className="py-2">
                            {ex.setRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSet(i, setIdx)}
                                className="text-slate-500 hover:text-red-400"
                                title="Remove set"
                              >
                                ×
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 flex flex-wrap items-end gap-4">
                  <button
                    type="button"
                    onClick={() => addSet(i)}
                    className="pb-1.5 text-sm text-brand-400 hover:text-brand-300"
                  >
                    + Add set
                  </button>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Duration (sec)</label>
                    <input
                      type="number"
                      min={0}
                      value={ex.duration ?? ""}
                      onChange={(e) =>
                        updateExercise(
                          i,
                          "duration",
                          e.target.value === ""
                            ? null
                            : parseInt(e.target.value, 10)
                        )}
                      className="w-24 rounded border border-slate-600 bg-slate-800 px-2 py-1.5 text-sm text-white"
                    />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Notes</label>
                    <input
                      type="text"
                      value={ex.notes ?? ""}
                      onChange={(e) =>
                        updateExercise(i, "notes", e.target.value || null)
                      }
                      placeholder="Optional"
                      className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1.5 text-sm text-white placeholder-slate-500"
                    />
                  </div>
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
