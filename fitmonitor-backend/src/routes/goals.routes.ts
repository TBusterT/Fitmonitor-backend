import { createCrudRouter } from '../utils/crudRouter';
import { authRequired } from '../middleware/auth';
import { toDateOrUndefined } from '../utils/http';
import { Router } from 'express';

const protectedRouter = createCrudRouter({
  model: 'goal',
  orderBy: { createdAt: 'desc' },
  protectUserData: true,
  where: (query, userId) => ({
    userId,
    ...(query.status ? { status: String(query.status) } : {})
  }),
  mapCreate: (body, userId) => ({ ...body, userId, deadline: toDateOrUndefined(body.deadline) }),
  mapUpdate: (body) => ({ ...body, deadline: toDateOrUndefined(body.deadline) })
});

const router = Router();
router.use(authRequired);
router.use(protectedRouter);

export default router;
