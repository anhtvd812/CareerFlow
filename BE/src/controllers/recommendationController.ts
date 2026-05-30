import type { NextFunction, Request, Response } from 'express';
import { recommendRoadmap } from '../services/recommendationService';
import { ApiError } from '../utils/errors';
import { validateRoadmapRecommendationPayload } from '../validators/recommendationValidators';

const resolveUserId = (user: Request['user']) => {
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

  throw new ApiError(401, 'AUTH_REQUIRED', 'Missing authenticated user.');
};

export const recommendRoadmapHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const input = validateRoadmapRecommendationPayload(req.body);
    const userId = resolveUserId(req.user);
    const roadmap = await recommendRoadmap({ userId, input });
    res.status(201).json(roadmap);
  } catch (error) {
    next(error);
  }
};
