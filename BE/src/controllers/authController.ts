import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/errors';
import { loginUser, logoutUser, registerUser } from '../services/authService';

const ensureString = (value: unknown, field: string) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} is required.`, { field });
  }
  return value.trim();
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const name = ensureString(req.body?.name, 'name');
    const email = ensureString(req.body?.email, 'email');
    const password = ensureString(req.body?.password, 'password');

    const user = await registerUser({ name, email, password });
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = ensureString(req.body?.email, 'email');
    const password = ensureString(req.body?.password, 'password');

    const result = await loginUser({ email, password });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await logoutUser();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
