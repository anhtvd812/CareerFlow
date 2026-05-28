import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';
import { getEnv } from '../utils/env';
import { ApiError } from '../utils/errors';

const buildPasswordHash = (password: string) => {
  const secret = getEnv('JWT_SECRET', 'change_me');
  return crypto.createHmac('sha256', secret).update(password).digest('hex');
};

export const hashPassword = async (password: string) => buildPasswordHash(password);

export const verifyPassword = async (password: string, passwordHash: string) =>
  buildPasswordHash(password) === passwordHash;

export const registerUser = async (params: {
  name: string;
  email: string;
  password: string;
}) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: params.email },
  });

  if (existingUser) {
    throw new ApiError(409, 'EMAIL_ALREADY_EXISTS', 'Email already exists.');
  }

  const passwordHash = await hashPassword(params.password);

  const user = await prisma.user.create({
    data: {
      name: params.name,
      email: params.email,
      passwordHash,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};

export const loginUser = async (params: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: params.email },
  });

  if (!user) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  const isValid = await verifyPassword(params.password, user.passwordHash);
  if (!isValid) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    getEnv('JWT_SECRET', 'change_me'),
    {
      expiresIn: '7d',
    },
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const logoutUser = async () => ({
  message: 'Logged out.',
});
