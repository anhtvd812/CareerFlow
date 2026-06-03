import type { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const asyncHandler =
  (handler: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };

export const notFound = (message = 'Resource not found.') => new AppError(404, message);

export const forbidden = (message = 'You do not have permission to access this resource.') =>
  new AppError(403, message);

export const badRequest = (message = 'Invalid request.') => new AppError(400, message);
