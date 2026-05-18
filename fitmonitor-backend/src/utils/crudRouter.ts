import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from './asyncHandler';
import { HttpError, toInt } from './http';

type PrismaModelName =
    | 'workoutType'
    | 'exercise'
    | 'achievement'
    | 'goal'
    | 'calendarEvent'
    | 'recipe'
    | 'mealPlan'
    | 'dietEntry'
    | 'healthMetric';

type CrudOptions = {
  model: PrismaModelName;
  orderBy?: Record<string, 'asc' | 'desc'>;
  where?: (query: Record<string, unknown>, userId?: number) => Record<string, unknown>;
  mapCreate?: (body: Record<string, unknown>, userId?: number) => Record<string, unknown>;
  mapUpdate?: (body: Record<string, unknown>, userId?: number) => Record<string, unknown>;
  include?: Record<string, unknown>;
  protectUserData?: boolean;
};

const modelClient = (model: PrismaModelName) => (prisma as unknown as Record<string, any>)[model];

export const createCrudRouter = (options: CrudOptions) => {
  const router = Router();
  const client = modelClient(options.model);

  router.get('/', asyncHandler(async (req, res) => {
    const where = options.where?.(req.query as Record<string, unknown>, req.user?.id) ?? {};
    const items = await client.findMany({
      where,
      include: options.include,
      orderBy: options.orderBy ?? { id: 'asc' }
    });
    res.json({ success: true, data: items });
  }));

  router.get('/:id', asyncHandler(async (req, res) => {
    const id = toInt(req.params.id);
    const where: Record<string, unknown> = { id };
    if (options.protectUserData && req.user?.id) where.userId = req.user.id;

    const item = await client.findFirst({ where, include: options.include });
    if (!item) throw new HttpError(404, 'Запис не знайдено');
    res.json({ success: true, data: item });
  }));

  router.post('/', asyncHandler(async (req, res) => {
    const data = options.mapCreate?.(req.body, req.user?.id) ?? req.body;
    const item = await client.create({ data });
    res.status(201).json({ success: true, data: item });
  }));

  router.patch('/:id', asyncHandler(async (req, res) => {
    const id = toInt(req.params.id);
    const where: Record<string, unknown> = { id };
    if (options.protectUserData && req.user?.id) where.userId = req.user.id;

    const existing = await client.findFirst({ where });
    if (!existing) throw new HttpError(404, 'Запис не знайдено');

    const data = options.mapUpdate?.(req.body, req.user?.id) ?? req.body;
    const item = await client.update({ where: { id }, data });
    res.json({ success: true, data: item });
  }));

  router.delete('/:id', asyncHandler(async (req, res) => {
    const id = toInt(req.params.id);
    const where: Record<string, unknown> = { id };
    if (options.protectUserData && req.user?.id) where.userId = req.user.id;

    const existing = await client.findFirst({ where });
    if (!existing) throw new HttpError(404, 'Запис не знайдено');

    await client.delete({ where: { id } });
    res.json({ success: true, message: 'Запис видалено' });
  }));

  return router;
};
