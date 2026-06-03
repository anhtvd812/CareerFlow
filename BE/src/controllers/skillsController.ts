import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/errors';
import { compareUserSkills } from '../services/skillsService';
import { validateSkillCompareQuery } from '../validators/skillsValidators';

const resolveUserId = (user: Request['user'], fallback?: string) => {
  if (typeof user === 'string') {
    return user;
  }

  if (user && typeof user === 'object') {
    if ('id' in user && typeof user.id === 'string') {
      return user.id;
    }
    if ('sub' in user && typeof user.sub === 'string') {
      return user.sub;
    }
  }

  if (fallback) {
    return fallback;
  }

  throw new ApiError(401, 'AUTH_REQUIRED', 'Missing authenticated user.');
};

export const compareSkillsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = validateSkillCompareQuery(req.query);
    const userId = resolveUserId(req.user, query.userId);
    const result = await compareUserSkills({ userId, careerId: query.careerId });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
