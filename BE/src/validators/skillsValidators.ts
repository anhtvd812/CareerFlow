import { ApiError } from '../utils/errors';

type SkillCompareQuery = {
  careerId: string;
  userId?: string;
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

export const validateSkillCompareQuery = (query: unknown): SkillCompareQuery => {
  if (!isRecord(query)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Query must be a JSON object.');
  }

  const careerId = ensureString(query.careerId, 'careerId');
  const userId = ensureOptionalString(query.userId, 'userId');

  return {
    careerId,
    userId,
  };
};
