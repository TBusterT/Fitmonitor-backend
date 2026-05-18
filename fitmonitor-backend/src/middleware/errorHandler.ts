import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/http';

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(new HttpError(404, `Маршрут не знайдено: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status = error instanceof HttpError ? error.status : 500;
  const message = error instanceof Error ? error.message : 'Внутрішня помилка сервера';

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    success: false,
    error: message
  });
};
