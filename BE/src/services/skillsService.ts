import type { Prisma } from '@prisma/client';
import { ApiError } from '../utils/errors';
import {
  getCareerById,
  listCareerSkills,
  listUserSkills,
} from '../repositories/skillsRepository';

type CompareSkillsInput = {
  userId: string;
  careerId: string;
};

type CareerSkillWithSkill = Prisma.CareerSkillGetPayload<{
  include: { skill: true };
}>;

type UserSkillWithSkill = Prisma.UserSkillGetPayload<{
  include: { skill: true };
}>;

export const compareUserSkills = async ({ userId, careerId }: CompareSkillsInput) => {
  const career = await getCareerById(careerId);
  if (!career) {
    throw new ApiError(404, 'CAREER_NOT_FOUND', 'Career not found.', { careerId });
  }

  const [careerSkills, userSkills] = await Promise.all([
    listCareerSkills(careerId),
    listUserSkills(userId),
  ]);

  if (careerSkills.length === 0) {
    throw new ApiError(404, 'CAREER_SKILLS_NOT_FOUND', 'Career has no standard skills.', {
      careerId,
    });
  }

  if (userSkills.length === 0) {
    throw new ApiError(404, 'USER_SKILLS_NOT_FOUND', 'User has no skills recorded.', {
      userId,
    });
  }

  const userSkillsMap = new Map<string, UserSkillWithSkill>(
    userSkills.map((skill) => [skill.skillId, skill]),
  );

  const skills = careerSkills.map((careerSkill: CareerSkillWithSkill) => {
    const userSkill = userSkillsMap.get(careerSkill.skillId);
    const currentLevel = userSkill?.level ?? 0;
    const standardLevel = careerSkill.level;

    return {
      skillId: careerSkill.skillId,
      skillName: careerSkill.skill.name,
      currentLevel,
      standardLevel,
      gap: standardLevel - currentLevel,
    };
  });

  return {
    userId,
    career: {
      id: career.id,
      title: career.title,
    },
    skills,
  };
};
