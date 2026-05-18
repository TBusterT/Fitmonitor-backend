import { createCrudRouter } from '../utils/crudRouter';

export default createCrudRouter({
  model: 'exercise',
  orderBy: { id: 'asc' }
});
