import { createCrudRouter } from '../utils/crudRouter';

export default createCrudRouter({
  model: 'workoutType',
  orderBy: { name: 'asc' }
});
