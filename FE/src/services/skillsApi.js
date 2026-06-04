import { currentSkills, requiredSkillsByCareer } from '../data/mockData';
import { clone, delay } from '../utils/mockApi';
import { getCurrentUserId, request } from './apiClient';

const DEFAULT_CAREER_ID = import.meta.env.VITE_DEMO_CAREER_ID || 'career_frontend_demo';

export async function getRequiredSkillsByCareer(careerTarget) {
  await delay(250);
  return clone(requiredSkillsByCareer[careerTarget] || []);
}

const compareLocalSkills = (userSkillsOrUserId, careerTargetOrRequiredSkills) => {
  const userSkills = Array.isArray(userSkillsOrUserId) ? userSkillsOrUserId : currentSkills;
  const requiredSkills = Array.isArray(careerTargetOrRequiredSkills)
    ? careerTargetOrRequiredSkills
    : requiredSkillsByCareer[careerTargetOrRequiredSkills] || requiredSkillsByCareer['Frontend Developer'];

  const skillsComparison = requiredSkills.map((requiredSkill) => {
    const userSkill = userSkills.find((skill) => skill.name === requiredSkill.name);
    const userLevel = userSkill?.level || 0;
    const gap = Math.max(requiredSkill.level - userLevel, 0);
    return {
      name: requiredSkill.name,
      userLevel,
      requiredLevel: requiredSkill.level,
      gap,
      match: Math.min(Math.round((userLevel / requiredSkill.level) * 100), 100),
    };
  });

  const matchPercentage = Math.round(
    skillsComparison.reduce((total, skill) => total + skill.match, 0) / skillsComparison.length,
  );

  return {
    matchedSkills: skillsComparison.filter((skill) => skill.gap === 0),
    missingSkills: skillsComparison.filter((skill) => skill.gap > 0),
    skillsComparison,
    matchPercentage,
  };
};

const toUiComparison = (payload) => {
  const skillsComparison = (payload.skills || []).map((skill) => {
    const requiredLevel = skill.standardLevel || 1;
    const userLevel = skill.currentLevel || 0;
    const gap = Math.max(skill.gap || requiredLevel - userLevel, 0);
    return {
      name: skill.skillName,
      userLevel,
      requiredLevel,
      gap,
      match: Math.min(Math.round((userLevel / requiredLevel) * 100), 100),
    };
  });

  const matchPercentage = skillsComparison.length
    ? Math.round(skillsComparison.reduce((total, skill) => total + skill.match, 0) / skillsComparison.length)
    : 0;

  return {
    matchedSkills: skillsComparison.filter((skill) => skill.gap <= 0),
    missingSkills: skillsComparison.filter((skill) => skill.gap > 0),
    skillsComparison,
    matchPercentage,
  };
};

export async function compareSkills(userSkillsOrUserId, careerTargetOrRequiredSkills) {
  try {
    const careerId =
      typeof careerTargetOrRequiredSkills === 'string' && careerTargetOrRequiredSkills.startsWith('career_')
        ? careerTargetOrRequiredSkills
        : DEFAULT_CAREER_ID;
    const params = new URLSearchParams({ careerId, userId: getCurrentUserId() });
    return toUiComparison(await request(`/skills/compare?${params.toString()}`));
  } catch (_error) {
    await delay();
    return compareLocalSkills(userSkillsOrUserId, careerTargetOrRequiredSkills);
  }
}
