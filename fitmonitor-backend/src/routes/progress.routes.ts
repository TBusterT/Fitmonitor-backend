import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authRequired } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError, required, toInt } from '../utils/http';

const router = Router();
router.use(authRequired);

const currentUserId = (req: { user?: { id: number } }) => req.user!.id;

router.get('/', asyncHandler(async (req, res) => {
  const stats = await prisma.progressStats.upsert({
    where: { userId: currentUserId(req) },
    create: { userId: currentUserId(req) },
    update: {}
  });

  const history = await prisma.progressHistory.findMany({
    where: { userId: currentUserId(req) },
    orderBy: { date: 'desc' },
    take: 10
  });

  res.json({
    success: true,
    data: {
      overall: stats,
      history
    }
  });
}));

router.get('/history', asyncHandler(async (req, res) => {
  const history = await prisma.progressHistory.findMany({
    where: { userId: currentUserId(req) },
    orderBy: { date: 'desc' }
  });
  res.json({ success: true, data: history });
}));

router.post('/history', asyncHandler(async (req, res) => {
  required(req.body, ['title', 'typeName', 'durationMinutes', 'calories']);
  const { title, typeName, durationMinutes, calories, image, date } = req.body;

  const result = await prisma.$transaction(async (tx: any) => {
    const item = await tx.progressHistory.create({
      data: {
        userId: currentUserId(req),
        title,
        typeName,
        durationMinutes: Number(durationMinutes),
        calories: Number(calories),
        image,
        date: date ? new Date(date) : new Date()
      }
    });

    const stats = await tx.progressStats.upsert({
      where: { userId: currentUserId(req) },
      create: {
        userId: currentUserId(req),
        workouts: 1,
        calories: Number(calories),
        activeMinutes: Number(durationMinutes),
        streak: 1
      },
      update: {
        workouts: { increment: 1 },
        calories: { increment: Number(calories) },
        activeMinutes: { increment: Number(durationMinutes) }
      }
    });

    return { item, stats };
  });

  res.status(201).json({ success: true, data: result });
}));

router.delete('/history/:id', asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const item = await prisma.progressHistory.findFirst({ where: { id, userId: currentUserId(req) } });
  if (!item) throw new HttpError(404, 'Запис історії не знайдено');

  await prisma.progressHistory.delete({ where: { id } });
  res.json({ success: true, message: 'Запис історії видалено' });
}));

export default router;
