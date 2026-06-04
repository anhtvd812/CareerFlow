import prisma from '../prisma/client';

export const getCareerById = (careerId: string) =>
  prisma.career.findUnique({
    where: {
      id: careerId,
    },
  });

export const listCareerSkills = (careerId: string) =>
  prisma.careerSkill.findMany({
    where: {
      careerId,
    },
    include: {
      skill: true,
    },
    orderBy: {
      level: 'desc',
    },
  });

export const listUserSkills = (userId: string) =>
  prisma.userSkill.findMany({
    where: {
      userId,
    },
    include: {
      skill: true,
    },
  });
