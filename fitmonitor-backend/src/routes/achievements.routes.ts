import { createCrudRouter } from '../utils/crudRouter';
import { toDateOrUndefined } from '../utils/http';

export default createCrudRouter({
  model: 'achievement',
  orderBy: { id: 'asc' },
  mapCreate: (body) => ({ ...body, unlockedDate: toDateOrUndefined(body.unlockedDate) }),
  mapUpdate: (body) => ({ ...body, unlockedDate: toDateOrUndefined(body.unlockedDate) })
});
