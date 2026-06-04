import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getEnv } from '../utils/env';
import { ApiError } from '../utils/errors';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'AUTH_REQUIRED', 'Missing authentication token.'));
  }

  const token = header.replace('Bearer ', '').trim();

  try {
    const decoded = jwt.verify(token, getEnv('JWT_SECRET', 'change_me'));
    req.user = decoded;
    return next();
  } catch (error) {
    return next(new ApiError(401, 'AUTH_INVALID', 'Invalid authentication token.'));
  }
};
