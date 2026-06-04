import { badRequest } from './errors';

const MAX_MESSAGE_LENGTH = 5000;
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export type Pagination = {
  page: number;
  limit: number;
  skip: number;
};

export type AttachmentInput = {
  url?: string;
  fileName: string;
  mimeType: string;
  size: number;
  dataBase64?: string;
};

export type MessageInput = {
  content?: string;
  attachment?: AttachmentInput;
  type: 'TEXT' | 'FILE';
};

export const parsePagination = (
  query: Record<string, unknown>,
  defaultLimit = 20,
  maxLimit = 100,
): Pagination => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || defaultLimit);

  if (!Number.isInteger(page) || page < 1) {
    throw badRequest('page must be a positive integer.');
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > maxLimit) {
    throw badRequest(`limit must be an integer from 1 to ${maxLimit}.`);
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

export const parseBooleanQuery = (value: unknown, fieldName: string) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === 'true' || value === true) {
    return true;
  }

  if (value === 'false' || value === false) {
    return false;
  }

  throw badRequest(`${fieldName} must be true or false.`);
};

export const optionalString = (value: unknown, fieldName: string, maxLength: number) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw badRequest(`${fieldName} must be a string.`);
  }

  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw badRequest(`${fieldName} must be at most ${maxLength} characters.`);
  }

  return trimmed || null;
};

export const requiredString = (value: unknown, fieldName: string, maxLength: number) => {
  const parsed = optionalString(value, fieldName, maxLength);
  if (!parsed) {
    throw badRequest(`${fieldName} is required.`);
  }

  return parsed;
};

export const optionalInteger = (
  value: unknown,
  fieldName: string,
  min: number,
  max: number,
) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw badRequest(`${fieldName} must be an integer from ${min} to ${max}.`);
  }

  return parsed;
};

export const optionalNumber = (value: unknown, fieldName: string, min: number, max: number) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw badRequest(`${fieldName} must be a number from ${min} to ${max}.`);
  }

  return parsed;
};

export const normalizeSpecialties = (value: unknown) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const rawItems = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : undefined;

  if (!rawItems) {
    throw badRequest('specialties must be an array of strings or a comma-separated string.');
  }

  const specialties = rawItems
    .map((item) => {
      if (typeof item !== 'string') {
        throw badRequest('specialties must only contain strings.');
      }

      return item.trim().toLowerCase();
    })
    .filter(Boolean);

  if (specialties.length > 20) {
    throw badRequest('specialties can contain at most 20 items.');
  }

  const uniqueSpecialties = [...new Set(specialties)];
  return uniqueSpecialties.length ? uniqueSpecialties.join(',') : null;
};

export const parseAttachment = (value: unknown): AttachmentInput | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw badRequest('attachment must be an object.');
  }

  const attachment = value as Record<string, unknown>;
  const url = optionalString(attachment.url, 'attachment.url', 2048) || undefined;
  const dataBase64 =
    optionalString(attachment.dataBase64, 'attachment.dataBase64', MAX_ATTACHMENT_SIZE * 2) ||
    undefined;
  const fileName = requiredString(attachment.fileName, 'attachment.fileName', 255);
  const mimeType = requiredString(attachment.mimeType, 'attachment.mimeType', 150).toLowerCase();
  const size = optionalInteger(attachment.size, 'attachment.size', 1, MAX_ATTACHMENT_SIZE);

  if (!size) {
    throw badRequest('attachment.size is required.');
  }

  if (!ALLOWED_ATTACHMENT_MIME_TYPES.has(mimeType)) {
    throw badRequest('Unsupported attachment file type.');
  }

  if (!url && !dataBase64) {
    throw badRequest('attachment.url or attachment.dataBase64 is required.');
  }

  if (dataBase64) {
    const normalizedBase64 = dataBase64.includes(',')
      ? dataBase64.slice(dataBase64.indexOf(',') + 1)
      : dataBase64;

    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(normalizedBase64)) {
      throw badRequest('attachment.dataBase64 must be valid base64.');
    }

    const decodedSize = Buffer.from(normalizedBase64, 'base64').length;
    if (decodedSize !== size) {
      throw badRequest('attachment.size does not match attachment.dataBase64.');
    }
  }

  return {
    url,
    fileName,
    mimeType,
    size,
    dataBase64,
  };
};

export const parseMessageInput = (body: Record<string, unknown>): MessageInput => {
  const content = optionalString(body.content, 'content', MAX_MESSAGE_LENGTH) || undefined;
  const attachment = parseAttachment(body.attachment);

  if (!content && !attachment) {
    throw badRequest('Message content or attachment is required.');
  }

  return {
    content,
    attachment,
    type: attachment ? 'FILE' : 'TEXT',
  };
};
