import { Router } from 'express';
import { authRequired } from '../middleware/auth';
import { createCrudRouter } from '../utils/crudRouter';
import { toDateOrUndefined } from '../utils/http';

const protectedRouter = createCrudRouter({
  model: 'healthMetric',
  orderBy: { measuredAt: 'desc' },
  protectUserData: true,
  where: (_query, userId) => ({ userId }),
  mapCreate: (body, userId) => ({ ...body, userId, measuredAt: toDateOrUndefined(body.measuredAt) }),
  mapUpdate: (body) => ({ ...body, measuredAt: toDateOrUndefined(body.measuredAt) })
});

const router = Router();
router.use(authRequired);
router.use(protectedRouter);

export default router;
