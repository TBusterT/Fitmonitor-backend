import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import achievementsRoutes from './routes/achievements.routes';
import activeWorkoutsRoutes from './routes/activeWorkouts.routes';
import authRoutes from './routes/auth.routes';
import calendarEventsRoutes from './routes/calendarEvents.routes';
import dietEntriesRoutes from './routes/dietEntries.routes';
import exercisesRoutes from './routes/exercises.routes';
import goalsRoutes from './routes/goals.routes';
import healthMetricsRoutes from './routes/healthMetrics.routes';
import mealPlansRoutes from './routes/mealPlans.routes';
import progressRoutes from './routes/progress.routes';
import protectedRoutes from './routes/protected.routes';
import recipesRoutes from './routes/recipes.routes';
import trainingsRoutes from './routes/trainings.routes';
import workoutTypesRoutes from './routes/workoutTypes.routes';
import { errorHandler, notFound } from './middleware/errorHandler';

dotenv.config();

export const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }));
app.use(express.json());
app.use(express.static('public'));

app.get('/api/message', (_req, res) => {
  res.json({ success: true, message: 'FitMonitor API працює! 🏋️' });
});

app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok', service: 'fitmonitor-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/workout-types', workoutTypesRoutes);
app.use('/api/trainings', trainingsRoutes);
app.use('/api/exercises', exercisesRoutes);
app.use('/api/active-workouts', activeWorkoutsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/calendar-events', calendarEventsRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/meal-plans', mealPlansRoutes);
app.use('/api/diet-entries', dietEntriesRoutes);
app.use('/api/health-metrics', healthMetricsRoutes);

app.use(notFound);
app.use(errorHandler);
