import { currentSkills, requiredSkillsByCareer } from '../data/mockData';
import { clone, delay } from '../utils/mockApi';

export async function getRequiredSkillsByCareer(careerTarget) {
  await delay(250);
  return clone(requiredSkillsByCareer[careerTarget] || []);
}

export async function compareSkills(userSkillsOrUserId, careerTargetOrRequiredSkills) {
  await delay();
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
}
