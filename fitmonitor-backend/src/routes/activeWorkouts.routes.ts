import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authRequired } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError, required, toDateOrUndefined, toInt } from '../utils/http';

const router = Router();

router.use(authRequired);

const include = {
  type: true,
  training: true
};

const userId = (req: { user?: { id: number } }) => req.user!.id;

router.get('/grouped', asyncHandler(async (req, res) => {
  const statuses = req.query.status
    ? String(req.query.status).split(',').map((status) => status.trim())
    : ['ACTIVE', 'PLANNED'];

  const workouts = await prisma.activeWorkout.findMany({
    where: {
      userId: userId(req),
      status: { in: statuses as any[] }
    },
    include,
    orderBy: { startedAt: 'desc' }
  });

  const groupedMap = new Map<number, {
    typeId: number;
    typeName: string;
    count: number;
    totalCalories: number;
    totalMinutes: number;
    workouts: typeof workouts;
  }>();

  for (const workout of workouts) {
    const group = groupedMap.get(workout.typeId) ?? {
      typeId: workout.typeId,
      typeName: workout.type.name,
      count: 0,
      totalCalories: 0,
      totalMinutes: 0,
      workouts: [] as typeof workouts
    };

    group.count += 1;
    group.totalCalories += workout.caloriesBurned ?? 0;
    group.totalMinutes += workout.durationMinutes ?? 0;
    group.workouts.push(workout);
    groupedMap.set(workout.typeId, group);
  }

  res.json({
    success: true,
    data: Array.from(groupedMap.values())
  });
}));

router.get('/', asyncHandler(async (req, res) => {
  const status = req.query.status ? String(req.query.status) : undefined;

  const workouts = await prisma.activeWorkout.findMany({
    where: {
      userId: userId(req),
      ...(status ? { status: status as any } : {})
    },
    include,
    orderBy: { startedAt: 'desc' }
  });

  res.json({ success: true, data: workouts });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const workout = await prisma.activeWorkout.findFirst({
    where: { id, userId: userId(req) },
    include
  });

  if (!workout) throw new HttpError(404, 'Активне тренування не знайдено');
  res.json({ success: true, data: workout });
}));

router.post('/', asyncHandler(async (req, res) => {
  required(req.body, ['typeId', 'title']);
  const { typeId, trainingId, title, status, startedAt, durationMinutes, caloriesBurned, notes } = req.body;

  const workout = await prisma.activeWorkout.create({
    data: {
      userId: userId(req),
      typeId: Number(typeId),
      trainingId: trainingId ? Number(trainingId) : undefined,
      title,
      status: status ?? 'ACTIVE',
      startedAt: toDateOrUndefined(startedAt) ?? new Date(),
      durationMinutes: durationMinutes === undefined ? undefined : Number(durationMinutes),
      caloriesBurned: caloriesBurned === undefined ? undefined : Number(caloriesBurned),
      notes
    },
    include
  });

  res.status(201).json({ success: true, data: workout });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const existing = await prisma.activeWorkout.findFirst({ where: { id, userId: userId(req) } });
  if (!existing) throw new HttpError(404, 'Активне тренування не знайдено');

  const data: Record<string, unknown> = { ...req.body };
  if (data.typeId !== undefined) data.typeId = Number(data.typeId);
  if (data.trainingId !== undefined && data.trainingId !== null) data.trainingId = Number(data.trainingId);
  if (data.startedAt !== undefined) data.startedAt = toDateOrUndefined(data.startedAt);
  if (data.finishedAt !== undefined) data.finishedAt = toDateOrUndefined(data.finishedAt);
  if (data.durationMinutes !== undefined) data.durationMinutes = Number(data.durationMinutes);
  if (data.caloriesBurned !== undefined) data.caloriesBurned = Number(data.caloriesBurned);

  const workout = await prisma.activeWorkout.update({ where: { id }, data, include });
  res.json({ success: true, data: workout });
}));

router.patch('/:id/finish', asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const existing = await prisma.activeWorkout.findFirst({
    where: { id, userId: userId(req) },
    include
  });

  if (!existing) throw new HttpError(404, 'Активне тренування не знайдено');
  if (existing.status === 'COMPLETED') throw new HttpError(409, 'Тренування вже завершено');

  const durationMinutes = req.body.durationMinutes !== undefined
    ? Number(req.body.durationMinutes)
    : Math.max(1, Math.round((Date.now() - existing.startedAt.getTime()) / 60000));

  const caloriesBurned = req.body.caloriesBurned !== undefined
    ? Number(req.body.caloriesBurned)
    : existing.caloriesBurned ?? existing.training?.calories ?? 0;

  const result = await prisma.$transaction(async (tx: any) => {
    const workout = await tx.activeWorkout.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        finishedAt: new Date(),
        durationMinutes,
        caloriesBurned,
        notes: req.body.notes ?? existing.notes
      },
      include
    });

    const history = await tx.progressHistory.create({
      data: {
        userId: userId(req),
        activeWorkoutId: workout.id,
        title: workout.title,
        typeName: workout.type.name,
        durationMinutes,
        calories: caloriesBurned,
        image: workout.training?.image ?? workout.type.image
      }
    });

    const stats = await tx.progressStats.upsert({
      where: { userId: userId(req) },
      create: {
        userId: userId(req),
        workouts: 1,
        calories: caloriesBurned,
        activeMinutes: durationMinutes,
        streak: 1
      },
      update: {
        workouts: { increment: 1 },
        calories: { increment: caloriesBurned },
        activeMinutes: { increment: durationMinutes }
      }
    });

    return { workout, history, stats };
  });

  res.json({ success: true, data: result });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const existing = await prisma.activeWorkout.findFirst({ where: { id, userId: userId(req) } });
  if (!existing) throw new HttpError(404, 'Активне тренування не знайдено');

  await prisma.activeWorkout.delete({ where: { id } });
  res.json({ success: true, message: 'Активне тренування видалено' });
}));

export default router;
