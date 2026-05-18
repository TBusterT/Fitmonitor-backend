import { Router } from 'express';
import { authRequired } from '../middleware/auth';
import { createCrudRouter } from '../utils/crudRouter';

const protectedRouter = createCrudRouter({
  model: 'dietEntry',
  orderBy: { addedAt: 'desc' },
  protectUserData: true,
  where: (query, userId) => ({
    userId,
    ...(query.mealType ? { mealType: String(query.mealType) } : {})
  }),
  mapCreate: (body, userId) => ({ ...body, userId }),
  mapUpdate: (body) => ({ ...body })
});

const router = Router();
router.use(authRequired);
router.use(protectedRouter);

export default router;
