import { ApiError } from '../utils/errors';

export type SubmitAnswerInput = {
  questionId: string;
  choiceId?: string;
  answerText?: string;
};

export type AttemptAnswerInput = {
  questionId: string;
  choiceId?: string;
  answerText?: string;
};

type SubmitAssessmentPayload = {
  assessmentId: string;
  userId?: string;
  answers: SubmitAnswerInput[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const ensureString = (value: unknown, field: string) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} is required.`, { field });
  }
  return value.trim();
};

const ensureOptionalString = (value: unknown, field: string) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  return ensureString(value, field);
};

export const validateSubmitAssessmentPayload = (payload: unknown): SubmitAssessmentPayload => {
  if (!isRecord(payload)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Payload must be a JSON object.');
  }

  const assessmentId = ensureString(payload.assessmentId, 'assessmentId');
  const userId = ensureOptionalString(payload.userId, 'userId');

  if (!Array.isArray(payload.answers) || payload.answers.length === 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'answers must be a non-empty array.');
  }

  const questionIds = new Set<string>();
  const answers = payload.answers.map((answer, index) => {
    if (!isRecord(answer)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Each answer must be an object.', { index });
    }

    const questionId = ensureString(answer.questionId, 'answers.questionId');
    const choiceId = ensureOptionalString(answer.choiceId, 'answers.choiceId');
    const answerText = ensureOptionalString(answer.answerText, 'answers.answerText');

    if (!choiceId && !answerText) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Answer must include choiceId or answerText.', {
        index,
      });
    }

    if (questionIds.has(questionId)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Duplicate answers for the same question.', {
        questionId,
      });
    }

    questionIds.add(questionId);

    return {
      questionId,
      choiceId,
      answerText,
    };
  });

  return {
    assessmentId,
    userId,
    answers,
  };
};

export const validateAssessmentIdParam = (value: unknown) => ensureString(value, 'assessmentId');

export const validateAttemptIdParam = (value: unknown) => ensureString(value, 'attemptId');

export const validateAttemptAnswersPayload = (payload: unknown): AttemptAnswerInput[] => {
  if (!isRecord(payload)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Payload must be a JSON object.');
  }

  if (!Array.isArray(payload.answers) || payload.answers.length === 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'answers must be a non-empty array.');
  }

  const questionIds = new Set<string>();
  return payload.answers.map((answer, index) => {
    if (!isRecord(answer)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Each answer must be an object.', { index });
    }

    const questionId = ensureString(answer.questionId, 'answers.questionId');
    const choiceId = ensureOptionalString(answer.choiceId, 'answers.choiceId');
    const answerText = ensureOptionalString(answer.answerText, 'answers.answerText');

    if (!choiceId && !answerText) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Answer must include choiceId or answerText.', {
        index,
      });
    }

    if (questionIds.has(questionId)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Duplicate answers for the same question.', {
        questionId,
      });
    }

    questionIds.add(questionId);

    return {
      questionId,
      choiceId,
      answerText,
    };
  });
};

export const validateResultIdParam = (value: unknown) => ensureString(value, 'resultId');

export const validateUserIdParam = (value: unknown) => ensureString(value, 'userId');
