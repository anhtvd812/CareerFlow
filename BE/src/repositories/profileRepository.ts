import prisma from '../prisma/client';

export const getProfileByUserId = (userId: string) =>
  prisma.userProfile.findUnique({
    where: { userId },
    include: {
      careerGoalRef: true,
    },
  });

export const upsertProfile = (userId: string, data: {
  headline?: string | null;
  bio?: string | null;
  careerGoal?: string | null;
  careerGoalId?: string | null;
  progressPercent?: number;
  lastAssessmentResultId?: string | null;
  lastAssessmentTakenAt?: Date | null;
}) => {
  const updateData: any = {};
  const createData: any = {
    user: {
      connect: { id: userId },
    },
  };

  // Set scalar fields
  if (data.headline !== undefined) updateData.headline = data.headline;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.careerGoal !== undefined) updateData.careerGoal = data.careerGoal;
  if (data.progressPercent !== undefined) updateData.progressPercent = data.progressPercent;
  if (data.lastAssessmentTakenAt !== undefined) updateData.lastAssessmentTakenAt = data.lastAssessmentTakenAt;

  // Set create scalar fields
  if (data.headline !== undefined) createData.headline = data.headline ?? null;
  if (data.bio !== undefined) createData.bio = data.bio ?? null;
  if (data.careerGoal !== undefined) createData.careerGoal = data.careerGoal ?? null;
  if (data.progressPercent !== undefined) createData.progressPercent = data.progressPercent ?? 0;
  else createData.progressPercent = 0;
  if (data.lastAssessmentTakenAt !== undefined) createData.lastAssessmentTakenAt = data.lastAssessmentTakenAt;

  // Handle careerGoalId through the relation (never set it directly)
  if (data.careerGoalId !== undefined) {
    if (data.careerGoalId) {
      updateData.careerGoalRef = { connect: { id: data.careerGoalId } };
      createData.careerGoalRef = { connect: { id: data.careerGoalId } };
    } else {
      updateData.careerGoalRef = { disconnect: true };
    }
  }

  // Handle lastAssessmentResultId through the relation (never set it directly)
  if (data.lastAssessmentResultId !== undefined) {
    if (data.lastAssessmentResultId) {
      updateData.lastAssessmentResult = { connect: { id: data.lastAssessmentResultId } };
    } else {
      updateData.lastAssessmentResult = { disconnect: true };
    }
  }

  return prisma.userProfile.upsert({
    where: { userId },
    update: updateData,
    create: createData,
    include: {
      careerGoalRef: true,
    },
  });
};

export const upsertUserSkills = (userId: string, skills: {
  skillId: string;
  level: number;
  source: 'MANUAL' | 'ASSESSMENT' | 'ROADMAP' | 'CERTIFICATION';
}[]) =>
  prisma.$transaction(
    skills.map((skill) =>
      prisma.userSkill.upsert({
        where: {
          userId_skillId: {
            userId,
            skillId: skill.skillId,
          },
        },
        update: {
          level: skill.level,
          source: skill.source,
        },
        create: {
          userId,
          skillId: skill.skillId,
          level: skill.level,
          source: skill.source,
        },
      }),
    ),
  );

export const listUserSkills = (userId: string) =>
  prisma.userSkill.findMany({
    where: { userId },
    include: {
      skill: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

export const listUserCertifications = (userId: string) =>
  prisma.userCertification.findMany({
    where: { userId },
    orderBy: {
      issuedAt: 'desc',
    },
  });

export const createUserCertification = (userId: string, data: {
  name: string;
  issuer?: string | null;
  issuedAt?: Date | null;
  expiresAt?: Date | null;
  credentialUrl?: string | null;
}) =>
  prisma.userCertification.create({
    data: {
      userId,
      name: data.name,
      issuer: data.issuer ?? null,
      issuedAt: data.issuedAt ?? null,
      expiresAt: data.expiresAt ?? null,
      credentialUrl: data.credentialUrl ?? null,
    },
  });

export const deleteUserCertification = (userId: string, certificationId: string) =>
  prisma.userCertification.deleteMany({
    where: {
      id: certificationId,
      userId,
    },
  });

export const getUserCertificationById = (certificationId: string) =>
  prisma.userCertification.findUnique({
    where: { id: certificationId },
  });
