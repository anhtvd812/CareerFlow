import type { Request } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import { AppError } from './errors';

export type AuthUser = {
  id: string;
  role?: string;
};

const isJwtPayload = (value: JwtPayload | string | undefined): value is JwtPayload =>
  Boolean(value && typeof value === 'object');

export const parseAuthUser = (payload: JwtPayload | string | undefined): AuthUser => {
  if (typeof payload === 'string' && payload.trim()) {
    return { id: payload.trim() };
  }

  if (!isJwtPayload(payload)) {
    throw new AppError(401, 'Authentication is required.');
  }

  const id = payload.userId || payload.id || payload.sub;
  if (typeof id !== 'string' || !id.trim()) {
    throw new AppError(401, 'Authentication token is missing a user id.');
  }

  return {
    id: id.trim(),
    role: typeof payload.role === 'string' ? payload.role : undefined,
  };
};

export const getAuthUser = (req: Request): AuthUser => parseAuthUser(req.user);

export const canManageMentorProfile = (
  authUser: AuthUser,
  mentorUserId: string,
) => authUser.id === mentorUserId || authUser.role === 'ADMIN';
