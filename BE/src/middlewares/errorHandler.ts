import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/errors';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found.` });
};

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
      details: error.details,
    });
  }

  console.error(error);
  return res.status(500).json({
    message: 'Internal server error.',
    code: 'INTERNAL_SERVER_ERROR',
  });
};
