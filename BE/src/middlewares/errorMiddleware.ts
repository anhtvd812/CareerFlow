import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found.` });
};

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (error.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({ message: 'Database request failed.' });
  }

  console.error(error);
  return res.status(500).json({ message: 'Internal server error.' });
};
