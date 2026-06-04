import type { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import prisma from '../prisma/client';
import { canManageMentorProfile, getAuthUser } from '../utils/auth';
import { badRequest, forbidden, notFound } from '../utils/errors';
import {
  normalizeSpecialties,
  optionalInteger,
  optionalNumber,
  optionalString,
  parseBooleanQuery,
  parsePagination,
  requiredString,
} from '../utils/validation';

const mentorSelect = {
  id: true,
  userId: true,
  headline: true,
  bio: true,
  primarySpecialty: true,
  specialties: true,
  yearsOfExperience: true,
  hourlyRate: true,
  location: true,
  isAvailable: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
} as const;

type MentorRecord = Prisma.MentorGetPayload<{ select: typeof mentorSelect }>;

const serializeMentor = (mentor: MentorRecord) => ({
  ...mentor,
  specialties: mentor.specialties ? mentor.specialties.split(',') : [],
  hourlyRate: mentor.hourlyRate === null ? null : Number(mentor.hourlyRate),
});

const parseMentorPayload = (body: Record<string, unknown>, requireUserId = false) => {
  const userId = requireUserId
    ? requiredString(body.userId, 'userId', 191)
    : optionalString(body.userId, 'userId', 191);
  const primarySpecialty = optionalString(body.primarySpecialty, 'primarySpecialty', 100);
  const specialties = normalizeSpecialties(body.specialties);
  const yearsOfExperience = optionalInteger(body.yearsOfExperience, 'yearsOfExperience', 0, 80);
  const hourlyRate = optionalNumber(body.hourlyRate, 'hourlyRate', 0, 1000000);
  const isAvailable =
    body.isAvailable === undefined ? undefined : parseBooleanQuery(body.isAvailable, 'isAvailable');

  return {
    userId,
    headline: optionalString(body.headline, 'headline', 255),
    bio: optionalString(body.bio, 'bio', 5000),
    primarySpecialty: primarySpecialty ? primarySpecialty.toLowerCase() : primarySpecialty,
    specialties,
    yearsOfExperience,
    hourlyRate,
    location: optionalString(body.location, 'location', 255),
    isAvailable,
  };
};

export const listMentors = async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const search = optionalString(req.query.q, 'q', 100);
  const specialty = optionalString(req.query.specialty, 'specialty', 100);
  const isAvailable = parseBooleanQuery(req.query.available, 'available');
  const where: Prisma.MentorWhereInput = {};
  const and: Prisma.MentorWhereInput[] = [];

  if (search) {
    and.push({
      OR: [
        { headline: { contains: search } },
        { bio: { contains: search } },
        { primarySpecialty: { contains: search.toLowerCase() } },
        { specialties: { contains: search.toLowerCase() } },
        { user: { name: { contains: search } } },
      ],
    });
  }

  if (specialty) {
    const normalizedSpecialty = specialty.toLowerCase();
    and.push({
      OR: [
        { primarySpecialty: normalizedSpecialty },
        { specialties: { contains: normalizedSpecialty } },
      ],
    });
  }

  if (isAvailable !== undefined) {
    and.push({ isAvailable });
  }

  if (and.length) {
    where.AND = and;
  }

  const [total, mentors] = await prisma.$transaction([
    prisma.mentor.count({ where }),
    prisma.mentor.findMany({
      where,
      select: mentorSelect,
      orderBy: [{ isAvailable: 'desc' }, { updatedAt: 'desc' }],
      skip,
      take: limit,
    }),
  ]);

  res.json({
    data: mentors.map(serializeMentor),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const getMentorById = async (req: Request, res: Response) => {
  const mentor = await prisma.mentor.findUnique({
    where: { id: req.params.mentorId },
    select: mentorSelect,
  });

  if (!mentor) {
    throw notFound('Mentor not found.');
  }

  res.json({ data: serializeMentor(mentor) });
};

export const createMentor = async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const body =
    req.body && typeof req.body === 'object' && !Array.isArray(req.body)
      ? (req.body as Record<string, unknown>)
      : {};
  const payload = parseMentorPayload(body, authUser.role === 'ADMIN');
  const targetUserId = payload.userId || authUser.id;

  if (!canManageMentorProfile(authUser, targetUserId)) {
    throw forbidden('Only admins can create mentor profiles for another user.');
  }

  const user = await prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true } });
  if (!user) {
    throw badRequest('User does not exist.');
  }

  const created = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: targetUserId },
      data: { role: 'MENTOR' },
    });

    return tx.mentor.create({
      data: {
        userId: targetUserId,
        headline: payload.headline,
        bio: payload.bio,
        primarySpecialty: payload.primarySpecialty,
        specialties: payload.specialties,
        yearsOfExperience: payload.yearsOfExperience,
        hourlyRate: payload.hourlyRate,
        location: payload.location,
        isAvailable: payload.isAvailable,
      },
      select: mentorSelect,
    });
  });

  res.status(201).json({ data: serializeMentor(created) });
};

export const updateMentor = async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const mentor = await prisma.mentor.findUnique({
    where: { id: req.params.mentorId },
    select: { id: true, userId: true },
  });

  if (!mentor) {
    throw notFound('Mentor not found.');
  }

  if (!canManageMentorProfile(authUser, mentor.userId)) {
    throw forbidden('Only the profile owner or an admin can update this mentor profile.');
  }

  const body =
    req.body && typeof req.body === 'object' && !Array.isArray(req.body)
      ? (req.body as Record<string, unknown>)
      : {};
  const payload = parseMentorPayload(body);
  const updated = await prisma.mentor.update({
    where: { id: mentor.id },
    data: {
      headline: payload.headline,
      bio: payload.bio,
      primarySpecialty: payload.primarySpecialty,
      specialties: payload.specialties,
      yearsOfExperience: payload.yearsOfExperience,
      hourlyRate: payload.hourlyRate,
      location: payload.location,
      isAvailable: payload.isAvailable,
    },
    select: mentorSelect,
  });

  res.json({ data: serializeMentor(updated) });
};
