import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const exercises = [
  // Strength - Chest
  { name: "Bench Press", description: "Barbell flat bench press", muscleGroup: "Chest", equipment: "Barbell" },
  { name: "Incline Dumbbell Press", description: "Incline bench dumbbell press", muscleGroup: "Chest", equipment: "Dumbbell" },
  { name: "Push-ups", description: "Bodyweight push-ups", muscleGroup: "Chest", equipment: "Bodyweight" },
  { name: "Cable Fly", description: "Cable chest fly", muscleGroup: "Chest", equipment: "Cable" },
  { name: "Dips", description: "Chest/triceps dips", muscleGroup: "Chest", equipment: "Bodyweight" },
  // Back
  { name: "Deadlift", description: "Conventional barbell deadlift", muscleGroup: "Back", equipment: "Barbell" },
  { name: "Barbell Row", description: "Bent-over barbell row", muscleGroup: "Back", equipment: "Barbell" },
  { name: "Pull-ups", description: "Wide-grip pull-ups", muscleGroup: "Back", equipment: "Bodyweight" },
  { name: "Lat Pulldown", description: "Cable lat pulldown", muscleGroup: "Back", equipment: "Cable" },
  { name: "Dumbbell Row", description: "Single-arm dumbbell row", muscleGroup: "Back", equipment: "Dumbbell" },
  { name: "Face Pull", description: "Cable face pull for rear delts", muscleGroup: "Back", equipment: "Cable" },
  // Shoulders
  { name: "Overhead Press", description: "Barbell overhead press", muscleGroup: "Shoulders", equipment: "Barbell" },
  { name: "Dumbbell Lateral Raise", description: "Lateral raise", muscleGroup: "Shoulders", equipment: "Dumbbell" },
  { name: "Arnold Press", description: "Arnold dumbbell press", muscleGroup: "Shoulders", equipment: "Dumbbell" },
  { name: "Front Raise", description: "Dumbbell front raise", muscleGroup: "Shoulders", equipment: "Dumbbell" },
  // Legs
  { name: "Squat", description: "Barbell back squat", muscleGroup: "Legs", equipment: "Barbell" },
  { name: "Romanian Deadlift", description: "RDL for hamstrings", muscleGroup: "Legs", equipment: "Barbell" },
  { name: "Leg Press", description: "Leg press machine", muscleGroup: "Legs", equipment: "Machine" },
  { name: "Leg Curl", description: "Leg curl machine", muscleGroup: "Legs", equipment: "Machine" },
  { name: "Leg Extension", description: "Leg extension machine", muscleGroup: "Legs", equipment: "Machine" },
  { name: "Lunges", description: "Walking or stationary lunges", muscleGroup: "Legs", equipment: "Dumbbell" },
  { name: "Calf Raise", description: "Standing or seated calf raise", muscleGroup: "Legs", equipment: "Machine" },
  // Arms
  { name: "Barbell Curl", description: "Standing barbell curl", muscleGroup: "Biceps", equipment: "Barbell" },
  { name: "Hammer Curl", description: "Dumbbell hammer curl", muscleGroup: "Biceps", equipment: "Dumbbell" },
  { name: "Tricep Pushdown", description: "Cable tricep pushdown", muscleGroup: "Triceps", equipment: "Cable" },
  { name: "Skull Crusher", description: "Lying tricep extension", muscleGroup: "Triceps", equipment: "Barbell" },
  { name: "Close-Grip Bench", description: "Close-grip bench press", muscleGroup: "Triceps", equipment: "Barbell" },
  // Core
  { name: "Plank", description: "Front plank hold", muscleGroup: "Core", equipment: "Bodyweight" },
  { name: "Crunches", description: "Ab crunches", muscleGroup: "Core", equipment: "Bodyweight" },
  { name: "Russian Twist", description: "Russian twist with weight", muscleGroup: "Core", equipment: "Dumbbell" },
  { name: "Hanging Leg Raise", description: "Hanging leg raise", muscleGroup: "Core", equipment: "Bodyweight" },
  // Cardio
  { name: "Running", description: "Treadmill or outdoor run", muscleGroup: "Cardio", equipment: "Treadmill" },
  { name: "Cycling", description: "Stationary or road cycling", muscleGroup: "Cardio", equipment: "Bike" },
  { name: "Rowing", description: "Rowing machine", muscleGroup: "Cardio", equipment: "Rowing Machine" },
  { name: "Jump Rope", description: "Jump rope", muscleGroup: "Cardio", equipment: "Jump Rope" },
  { name: "Elliptical", description: "Elliptical machine", muscleGroup: "Cardio", equipment: "Elliptical" },
  // Flexibility
  { name: "Stretching", description: "General stretching", muscleGroup: "Flexibility", equipment: "Bodyweight" },
  { name: "Yoga", description: "Yoga flow or holds", muscleGroup: "Flexibility", equipment: "Bodyweight" },
];

async function main() {
  console.log("Seeding exercises...");
  for (const ex of exercises) {
    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: {},
      create: ex,
    });
  }
  console.log(`Seeded ${exercises.length} exercises.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
