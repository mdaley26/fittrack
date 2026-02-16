"use client";

import { useState, useMemo } from "react";

type Exercise = {
  id: string;
  name: string;
  description: string | null;
  muscleGroup: string | null;
  equipment: string | null;
};

export function ExerciseList({
  exercises,
  muscleGroups,
  equipmentList,
}: {
  exercises: Exercise[];
  muscleGroups: string[];
  equipmentList: string[];
}) {
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");

  const filtered = useMemo(() => {
    return exercises.filter((e) => {
      const matchSearch =
        !search.trim() ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        (e.muscleGroup?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (e.equipment?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchMuscle = !muscleFilter || e.muscleGroup === muscleFilter;
      const matchEquipment = !equipmentFilter || e.equipment === equipmentFilter;
      return matchSearch && matchMuscle && matchEquipment;
    });
  }, [exercises, search, muscleFilter, equipmentFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, muscle, equipment..."
          className="min-w-[200px] flex-1 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <select
          value={muscleFilter}
          onChange={(e) => setMuscleFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All muscle groups</option>
          {muscleGroups.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={equipmentFilter}
          onChange={(e) => setEquipmentFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All equipment</option>
          {equipmentList.map((eq) => (
            <option key={eq} value={eq}>
              {eq}
            </option>
          ))}
        </select>
      </div>
      <p className="text-sm text-slate-500">
        {filtered.length} exercise{filtered.length !== 1 ? "s" : ""}
      </p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ex) => (
          <li
            key={ex.id}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
          >
            <h3 className="font-medium text-white">{ex.name}</h3>
            <div className="mt-1 flex flex-wrap gap-2">
              {ex.muscleGroup && (
                <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                  {ex.muscleGroup}
                </span>
              )}
              {ex.equipment && (
                <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                  {ex.equipment}
                </span>
              )}
            </div>
            {ex.description && (
              <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                {ex.description}
              </p>
            )}
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-700 py-12 text-center text-slate-500">
          No exercises match your filters.
        </p>
      )}
    </div>
  );
}
