import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError, required, toInt } from '../utils/http';

const router = Router();

const include = {
  type: true,
  trainingExercises: {
    orderBy: { order: 'asc' as const },
    include: { exercise: true }
  }
};

router.get('/grouped/by-type', asyncHandler(async (_req, res) => {
  const types = await prisma.workoutType.findMany({
    orderBy: { name: 'asc' },
    include: {
      trainings: {
        orderBy: { title: 'asc' }
      }
    }
  });

  res.json({
    success: true,
    data: types.map((type: any) => ({
      typeId: type.id,
      typeName: type.name,
      count: type.trainings.length,
      trainings: type.trainings
    }))
  });
}));

router.get('/', asyncHandler(async (req, res) => {
  const typeId = req.query.typeId ? toInt(req.query.typeId, 'typeId') : undefined;
  const difficulty = req.query.difficulty ? String(req.query.difficulty) : undefined;

  const trainings = await prisma.training.findMany({
    where: {
      ...(typeId ? { typeId } : {}),
      ...(difficulty ? { difficulty: difficulty as any } : {})
    },
    include,
    orderBy: { id: 'asc' }
  });

  res.json({ success: true, data: trainings });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const training = await prisma.training.findUnique({ where: { id }, include });
  if (!training) throw new HttpError(404, 'Тренування не знайдено');
  res.json({ success: true, data: training });
}));

router.post('/', asyncHandler(async (req, res) => {
  required(req.body, ['title', 'description', 'durationMinutes', 'calories', 'typeId']);
  const { title, description, image, badge, durationMinutes, calories, difficulty, typeId } = req.body;

  const training = await prisma.training.create({
    data: {
      title,
      description,
      image,
      badge,
      durationMinutes: Number(durationMinutes),
      calories: Number(calories),
      difficulty: difficulty ?? 'BEGINNER',
      typeId: Number(typeId)
    },
    include
  });

  res.status(201).json({ success: true, data: training });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const existing = await prisma.training.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, 'Тренування не знайдено');

  const data: Record<string, unknown> = { ...req.body };
  if (data.durationMinutes !== undefined) data.durationMinutes = Number(data.durationMinutes);
  if (data.calories !== undefined) data.calories = Number(data.calories);
  if (data.typeId !== undefined) data.typeId = Number(data.typeId);

  const training = await prisma.training.update({ where: { id }, data, include });
  res.json({ success: true, data: training });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  await prisma.training.delete({ where: { id } });
  res.json({ success: true, message: 'Тренування видалено' });
}));

export default router;
