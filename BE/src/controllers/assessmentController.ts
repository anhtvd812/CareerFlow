import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/errors';
import {
  createAttempt,
  getAssessmentResult,
  getAssessmentQuestions,
  listAvailableAssessments,
  listAssessmentClassifications,
  listUserAssessmentHistory,
  saveAttemptAnswers,
  submitAttempt,
  submitAssessment,
} from '../services/assessmentService';
import {
  validateAssessmentIdParam,
  validateAttemptAnswersPayload,
  validateAttemptIdParam,
  validateResultIdParam,
  validateSubmitAssessmentPayload,
  validateUserIdParam,
} from '../validators/assessmentValidators';

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

export const submitAssessmentHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = validateSubmitAssessmentPayload(req.body);
    const userId = resolveUserId(req.user, payload.userId);
    const result = await submitAssessment({
      userId,
      assessmentId: payload.assessmentId,
      answers: payload.answers,
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const listAssessmentsHandler = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const assessments = await listAvailableAssessments();
    res.status(200).json({ assessments });
  } catch (error) {
    next(error);
  }
};

export const getAssessmentQuestionsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const assessmentId = validateAssessmentIdParam(req.params.id);
    const assessment = await getAssessmentQuestions(assessmentId);
    res.status(200).json(assessment);
  } catch (error) {
    next(error);
  }
};

export const createAttemptHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assessmentId = validateAssessmentIdParam(req.params.id);
    const userId = resolveUserId(req.user);
    const attempt = await createAttempt({ assessmentId, userId });
    res.status(201).json(attempt);
  } catch (error) {
    next(error);
  }
};

export const createTestAttemptHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assessmentId = validateAssessmentIdParam(req.params.testId);
    const userId = resolveUserId(req.user);
    const attempt = await createAttempt({ assessmentId, userId });
    res.status(201).json(attempt);
  } catch (error) {
    next(error);
  }
};

export const saveAttemptHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attemptId = validateAttemptIdParam(req.params.id);
    const userId = resolveUserId(req.user);
    const answers = validateAttemptAnswersPayload(req.body);
    const result = await saveAttemptAnswers({ attemptId, userId, answers });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const submitAttemptHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attemptId = validateAttemptIdParam(req.params.id);
    const userId = resolveUserId(req.user);
    const result = await submitAttempt({ attemptId, userId });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAssessmentResultHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resultId = validateResultIdParam(req.params.id);
    const result = await getAssessmentResult(resultId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const listUserAssessmentHistoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = validateUserIdParam(req.params.id);
    const results = await listUserAssessmentHistory(userId);
    res.status(200).json({ userId, results });
  } catch (error) {
    next(error);
  }
};

export const listAssessmentClassificationsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const classifications = await listAssessmentClassifications();
    res.status(200).json({ classifications });
  } catch (error) {
    next(error);
  }
};
