import { learningProfile } from '../data/mockData';
import { clone, delay } from '../utils/mockApi';

let profileStore = clone(learningProfile);

export async function createLearningProfile(testResult) {
  await delay();
  const careerTarget =
    testResult?.classification?.name || testResult?.recommendedCareer || profileStore.user.careerTarget;
  const matchPercentage =
    typeof testResult?.scores?.percentage === 'number'
      ? testResult.scores.percentage
      : Number(testResult?.matchPercentage || 0);
  profileStore = {
    ...profileStore,
    user: {
      ...profileStore.user,
      careerTarget,
    },
    overallProgress: Math.max(profileStore.overallProgress, Math.round(matchPercentage)),
  };
  return clone(profileStore);
}

export async function getLearningProfile(userId) {
  await delay();
  if (profileStore.user.id !== userId) {
    throw new Error('Không tìm thấy hồ sơ học tập.');
  }
  return clone(profileStore);
}

export async function updateLearningProfile(profileId, payload) {
  await delay();
  if (profileStore.id !== profileId) {
    throw new Error('Không tìm thấy hồ sơ học tập.');
  }
  profileStore = {
    ...profileStore,
    ...payload,
    user: { ...profileStore.user, ...(payload.user || {}) },
  };
  return clone(profileStore);
}

export async function addSkill(profileId, skill) {
  await delay();
  if (profileStore.id !== profileId) {
    throw new Error('Không tìm thấy hồ sơ học tập.');
  }
  profileStore.skills = [...profileStore.skills, { ...skill, level: Number(skill.level) || 0 }];
  return clone(profileStore);
}

export async function addCertificate(profileId, certificate) {
  await delay();
  if (profileStore.id !== profileId) {
    throw new Error('Không tìm thấy hồ sơ học tập.');
  }
  profileStore.certificates = [
    ...profileStore.certificates,
    {
      id: `cert_${Date.now()}`,
      issuer: certificate.issuer || 'Self Learning',
      issuedAt: certificate.issuedAt || new Date().toISOString().slice(0, 10),
      name: certificate.name,
    },
  ];
  return clone(profileStore);
}

export async function updateGoal(profileId, goalId, status) {
  await delay();
  if (profileStore.id !== profileId) {
    throw new Error('Không tìm thấy hồ sơ học tập.');
  }
  profileStore.goals = profileStore.goals.map((goal) => (goal.id === goalId ? { ...goal, status } : goal));
  return clone(profileStore);
}
