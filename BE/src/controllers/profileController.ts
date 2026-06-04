import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/errors';
import {
  addCertification,
  getProfile,
  listCertifications,
  removeCertification,
  updateProfile,
  updateSkills,
} from '../services/profileService';
import {
  validateCertificationIdParam,
  validateCertificationPayload,
  validateProfileUpdatePayload,
  validateSkillUpdatePayload,
} from '../validators/profileValidators';

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

export const getProfileHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = resolveUserId(req.user);
    const profile = await getProfile(userId);
    res.status(200).json(profile ?? { profile: null, skills: [], certifications: [] });
  } catch (error) {
    next(error);
  }
};

export const updateProfileHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = resolveUserId(req.user);
    const payload = validateProfileUpdatePayload(req.body);
    const profile = await updateProfile(userId, payload);
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

export const updateSkillsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = resolveUserId(req.user);
    const skills = validateSkillUpdatePayload(req.body);
    const result = await updateSkills(userId, skills);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const listCertificationsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = resolveUserId(req.user);
    const result = await listCertifications(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const addCertificationHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = resolveUserId(req.user);
    const payload = validateCertificationPayload(req.body);
    const result = await addCertification(userId, payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteCertificationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = resolveUserId(req.user);
    const certificationId = validateCertificationIdParam(req.params.id);
    const result = await removeCertification(userId, certificationId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
