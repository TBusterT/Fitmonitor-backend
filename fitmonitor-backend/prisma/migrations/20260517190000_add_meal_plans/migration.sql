CREATE TABLE IF NOT EXISTS "MealPlan" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "badge" TEXT NOT NULL,
  "image" TEXT,
  "description" TEXT NOT NULL,
  "calories" TEXT NOT NULL,
  "protein" TEXT NOT NULL,
  "fat" TEXT NOT NULL,
  "carbs" TEXT NOT NULL,
  "schedule" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
