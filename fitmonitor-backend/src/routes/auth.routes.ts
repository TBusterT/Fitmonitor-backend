import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authRequired } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError, required } from '../utils/http';
import { hashPassword, signJwt, verifyPassword } from '../utils/security';

const router = Router();

const publicUser = (user: { id: number; name: string; email: string; createdAt?: Date }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt
});

router.post('/register', asyncHandler(async (req, res) => {
  required(req.body, ['name', 'email', 'password']);
  const { name, email, password } = req.body as { name: string; email: string; password: string };

  if (password.length < 6) {
    throw new HttpError(400, 'Пароль має містити мінімум 6 символів');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new HttpError(409, 'Користувач з таким email вже існує');
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashPassword(password),
      progressStats: { create: {} }
    }
  });

  const token = signJwt({ sub: user.id, email: user.email, name: user.name });
  res.status(201).json({ success: true, token, user: publicUser(user) });
}));

router.post('/login', asyncHandler(async (req, res) => {
  required(req.body, ['email', 'password']);
  const { email, password } = req.body as { email: string; password: string };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new HttpError(401, 'Неправильний email або пароль');
  }

  const token = signJwt({ sub: user.id, email: user.email, name: user.name });
  res.json({ success: true, token, user: publicUser(user) });
}));

router.get('/me', authRequired, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, createdAt: true }
  });

  if (!user) throw new HttpError(404, 'Користувача не знайдено');
  res.json({ success: true, data: user });
}));

export default router;
