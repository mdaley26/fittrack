import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const profileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  age: z.coerce.number().int().min(1).max(150).optional().nullable(),
  weight: z.coerce.number().min(0).max(500).optional().nullable(),
  height: z.coerce.number().min(0).max(300).optional().nullable(),
  weightUnit: z.enum(["kg", "lb"]).optional(),
});

export const workoutSchema = z.object({
  date: z.string().min(1, "Date is required"),
  name: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

export const workoutSetSchema = z.object({
  setNumber: z.coerce.number().int().min(1),
  weight: z.coerce.number().min(0).optional().nullable(),
  reps: z.coerce.number().int().min(0).optional().nullable(),
});

export const workoutExerciseSchema = z.object({
  exerciseId: z.string().uuid(),
  sets: z.coerce.number().int().min(0).optional().nullable(),
  reps: z.coerce.number().int().min(0).optional().nullable(),
  weight: z.coerce.number().min(0).optional().nullable(),
  duration: z.coerce.number().int().min(0).optional().nullable(),
  notes: z.string().max(500).optional(),
  setRows: z.array(workoutSetSchema).optional(),
});

export const customExerciseSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(1000).optional(),
  muscleGroup: z.string().max(100).optional(),
  equipment: z.string().max(100).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type WorkoutInput = z.infer<typeof workoutSchema>;
export type WorkoutExerciseInput = z.infer<typeof workoutExerciseSchema>;
export type CustomExerciseInput = z.infer<typeof customExerciseSchema>;
