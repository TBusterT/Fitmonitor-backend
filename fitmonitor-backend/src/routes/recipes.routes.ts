import { createCrudRouter } from '../utils/crudRouter';

export default createCrudRouter({
  model: 'recipe',
  orderBy: { id: 'asc' },
  where: (query) => ({
    ...(query.category ? { category: String(query.category) } : {})
  })
});
