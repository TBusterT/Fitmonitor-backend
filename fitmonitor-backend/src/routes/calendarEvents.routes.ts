import { Router } from 'express';
import { authRequired } from '../middleware/auth';
import { createCrudRouter } from '../utils/crudRouter';
import { toDateOrUndefined } from '../utils/http';

const protectedRouter = createCrudRouter({
  model: 'calendarEvent',
  orderBy: { date: 'asc' },
  protectUserData: true,
  where: (_query, userId) => ({ userId }),
  mapCreate: (body, userId) => ({ ...body, userId, date: toDateOrUndefined(body.date) }),
  mapUpdate: (body) => ({ ...body, date: toDateOrUndefined(body.date) })
});

const router = Router();
router.use(authRequired);
router.use(protectedRouter);

export default router;
