import { Request, Response, NextFunction, RequestHandler } from 'express';

export type ErrorDetails = Record<string, unknown>;

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: ErrorDetails;

  constructor(statusCode: number, code: string, message: string, details?: ErrorDetails) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
  }
}

export class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const badRequest = (message: string, code = 'BAD_REQUEST', details?: ErrorDetails) => new ApiError(400, code, message, details);
export const forbidden = (message: string, code = 'FORBIDDEN', details?: ErrorDetails) => new ApiError(403, code, message, details);
export const notFound = (message: string, code = 'NOT_FOUND', details?: ErrorDetails) => new ApiError(404, code, message, details);
