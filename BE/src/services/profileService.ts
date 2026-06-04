import { ApiError } from '../utils/errors';
import {
  createUserCertification,
  deleteUserCertification,
  getProfileByUserId,
  getUserCertificationById,
  listUserCertifications,
  listUserSkills,
  upsertProfile,
  upsertUserSkills,
} from '../repositories/profileRepository';
import type { UserSkillSource } from '@prisma/client';

const formatProfile = (profile: Awaited<ReturnType<typeof getProfileByUserId>>) => {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    userId: profile.userId,
    headline: profile.headline,
    bio: profile.bio,
    careerGoal: profile.careerGoal,
    careerGoalId: profile.careerGoalId,
    careerGoalRef: profile.careerGoalRef
      ? {
          id: profile.careerGoalRef.id,
          title: profile.careerGoalRef.title,
        }
      : null,
    progressPercent: profile.progressPercent,
    lastAssessmentResultId: profile.lastAssessmentResultId,
    lastAssessmentTakenAt: profile.lastAssessmentTakenAt,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
};

const formatSkills = (skills: Awaited<ReturnType<typeof listUserSkills>>) =>
  skills.map((skill) => ({
    id: skill.id,
    skillId: skill.skillId,
    name: skill.skill.name,
    level: skill.level,
    source: skill.source,
    updatedAt: skill.updatedAt,
  }));

const formatCertifications = (certifications: Awaited<ReturnType<typeof listUserCertifications>>) =>
  certifications.map((cert) => ({
    id: cert.id,
    name: cert.name,
    issuer: cert.issuer,
    issuedAt: cert.issuedAt,
    expiresAt: cert.expiresAt,
    credentialUrl: cert.credentialUrl,
    updatedAt: cert.updatedAt,
  }));

export const getProfile = async (userId: string) => {
  const profile = await getProfileByUserId(userId);
  if (!profile) {
    return null;
  }

  const skills = await listUserSkills(userId);
  const certifications = await listUserCertifications(userId);

  return {
    profile: formatProfile(profile),
    skills: formatSkills(skills),
    certifications: formatCertifications(certifications),
  };
};

export const updateProfile = async (userId: string, data: {
  headline?: string | null;
  bio?: string | null;
  careerGoal?: string | null;
  careerGoalId?: string | null;
}) => {
  const profile = await upsertProfile(userId, data);
  return {
    profile: formatProfile(profile),
  };
};

export const updateSkills = async (userId: string, skills: {
  skillId: string;
  level: number;
  source: UserSkillSource;
}[]) => {
  if (skills.length === 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'skills must be a non-empty array.');
  }

  await upsertUserSkills(userId, skills);
  const updated = await listUserSkills(userId);
  return {
    skills: formatSkills(updated),
  };
};

export const listCertifications = async (userId: string) => {
  const certifications = await listUserCertifications(userId);
  return { certifications: formatCertifications(certifications) };
};

export const addCertification = async (userId: string, data: {
  name: string;
  issuer?: string | null;
  issuedAt?: Date | null;
  expiresAt?: Date | null;
  credentialUrl?: string | null;
}) => {
  const cert = await createUserCertification(userId, data);
  return {
    certification: {
      id: cert.id,
      name: cert.name,
      issuer: cert.issuer,
      issuedAt: cert.issuedAt,
      expiresAt: cert.expiresAt,
      credentialUrl: cert.credentialUrl,
      createdAt: cert.createdAt,
      updatedAt: cert.updatedAt,
    },
  };
};

export const removeCertification = async (userId: string, certificationId: string) => {
  const cert = await getUserCertificationById(certificationId);
  if (!cert) {
    throw new ApiError(404, 'CERTIFICATION_NOT_FOUND', 'Certification not found.');
  }

  if (cert.userId !== userId) {
    throw new ApiError(403, 'CERTIFICATION_FORBIDDEN', 'Not allowed to delete this certification.');
  }

  await deleteUserCertification(userId, certificationId);
  return { message: 'Certification deleted.' };
};

export const updateProfileFromAssessment = async (params: {
  userId: string;
  assessmentResultId: string;
  percentage: number;
  completedAt: Date;
}) => {
  const profile = await upsertProfile(params.userId, {
    progressPercent: params.percentage,
    lastAssessmentResultId: params.assessmentResultId,
    lastAssessmentTakenAt: params.completedAt,
  });

  return formatProfile(profile);
};
