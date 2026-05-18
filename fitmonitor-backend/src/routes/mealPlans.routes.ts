import { createCrudRouter } from '../utils/crudRouter';

export default createCrudRouter({
    model: 'mealPlan',
    orderBy: { id: 'asc' },
});
