import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/http';
import { verifyJwt } from '../utils/security';

export const authRequired = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new HttpError(401, 'Потрібна авторизація: Authorization: Bearer <token>');
    }

    const payload = verifyJwt(header.slice('Bearer '.length));
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name
    };

    next();
  } catch (error) {
    next(error);
  }
};
