import { Router } from 'express';
import { authRequired } from '../middleware/auth';

const router = Router();

router.get('/', authRequired, (req, res) => {
  res.json({
    success: true,
    message: 'Це захищений маршрут. Дані отримує тільки автентифікований користувач.',
    user: req.user
  });
});

export default router;
