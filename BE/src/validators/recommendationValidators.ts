import { ApiError } from '../utils/errors';

export type CurrentLevel = 'beginner' | 'intermediate' | 'advanced';

export type RoadmapRecommendationInput = {
  careerGoal: string;
  currentLevel?: CurrentLevel;
  currentSkills?: string[];
  assessmentResultId?: string;
};

const currentLevels = new Set<CurrentLevel>(['beginner', 'intermediate', 'advanced']);

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

const ensureCurrentLevel = (value: unknown) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const level = ensureString(value, 'currentLevel').toLowerCase();
  if (!currentLevels.has(level as CurrentLevel)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'currentLevel is invalid.', {
      field: 'currentLevel',
      allowedValues: Array.from(currentLevels),
    });
  }

  return level as CurrentLevel;
};

const ensureCurrentSkills = (value: unknown) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'currentSkills must be an array.', {
      field: 'currentSkills',
    });
  }

  if (value.length === 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'currentSkills cannot be empty.', {
      field: 'currentSkills',
    });
  }

  const normalized = value.map((item, index) => {
    if (typeof item !== 'string' || item.trim().length === 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'currentSkills must contain non-empty strings.', {
        field: 'currentSkills',
        index,
      });
    }

    return item.trim();
  });

  return Array.from(new Set(normalized));
};

export const validateRoadmapRecommendationPayload = (
  payload: unknown,
): RoadmapRecommendationInput => {
  if (!isRecord(payload)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Payload must be a JSON object.');
  }

  const careerGoal = ensureString(payload.careerGoal, 'careerGoal');
  const currentLevel = ensureCurrentLevel(payload.currentLevel);
  const currentSkills = ensureCurrentSkills(payload.currentSkills);
  const assessmentResultId = ensureOptionalString(payload.assessmentResultId, 'assessmentResultId');

  if (!currentLevel && !currentSkills && !assessmentResultId) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'Provide currentLevel, currentSkills, or assessmentResultId.',
      {
        fields: ['currentLevel', 'currentSkills', 'assessmentResultId'],
      },
    );
  }

  return {
    careerGoal,
    currentLevel,
    currentSkills,
    assessmentResultId,
  };
};
