import { ApiError } from '../utils/errors';

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
    return null;
  }
  if (typeof value !== 'string') {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} must be a string.`, { field });
  }
  return value.trim();
};

const ensureOptionalDate = (value: unknown, field: string) => {
  if (value === undefined || value === null) {
    return null;
  }
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} must be a valid date.`, { field });
  }
  return date;
};

const ensureOptionalUrl = (value: unknown, field: string) => {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} must be a string.`, { field });
  }
  if (value.trim().length === 0) {
    return null;
  }
  try {
    // Validate URL without changing stored value.
    new URL(value);
  } catch {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} must be a valid URL.`, { field });
  }
  return value.trim();
};

export const validateProfileUpdatePayload = (payload: unknown) => {
  if (!isRecord(payload)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Payload must be a JSON object.');
  }

  return {
    headline: ensureOptionalString(payload.headline, 'headline'),
    bio: ensureOptionalString(payload.bio, 'bio'),
    careerGoal: ensureOptionalString(payload.careerGoal, 'careerGoal'),
    careerGoalId: ensureOptionalString(payload.careerGoalId, 'careerGoalId'),
  };
};

export const validateSkillUpdatePayload = (payload: unknown) => {
  if (!isRecord(payload)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Payload must be a JSON object.');
  }

  if (!Array.isArray(payload.skills) || payload.skills.length === 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'skills must be a non-empty array.');
  }

  const skillIds = new Set<string>();

  return payload.skills.map((skill, index) => {
    if (!isRecord(skill)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Each skill must be an object.', { index });
    }

    const skillId = ensureString(skill.skillId, 'skills.skillId');
    const level = Number(skill.level);

    if (Number.isNaN(level) || level < 1) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'skills.level must be a positive number.', {
        index,
      });
    }

    if (skillIds.has(skillId)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Duplicate skills are not allowed.', { skillId });
    }

    skillIds.add(skillId);

    const sourceValue = typeof skill.source === 'string' ? skill.source : 'MANUAL';
    const allowedSources = ['MANUAL', 'ASSESSMENT', 'ROADMAP', 'CERTIFICATION'];
    if (!allowedSources.includes(sourceValue)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'skills.source is invalid.', { source: sourceValue });
    }
    return {
      skillId,
      level,
      source: sourceValue,
    };
  });
};

export const validateCertificationPayload = (payload: unknown) => {
  if (!isRecord(payload)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Payload must be a JSON object.');
  }

  return {
    name: ensureString(payload.name, 'name'),
    issuer: ensureOptionalString(payload.issuer, 'issuer'),
    issuedAt: ensureOptionalDate(payload.issuedAt, 'issuedAt'),
    expiresAt: ensureOptionalDate(payload.expiresAt, 'expiresAt'),
    credentialUrl: ensureOptionalUrl(payload.credentialUrl, 'credentialUrl'),
  };
};

export const validateCertificationIdParam = (value: unknown) => ensureString(value, 'certificationId');
