import { learningProfile } from '../data/mockData';
import { clone, delay } from '../utils/mockApi';
import { getAuthUser, request } from './apiClient';

let profileStore = clone(learningProfile);

const toUiProfile = (payload) => {
  const authUser = getAuthUser();
  const profile = payload?.profile;

  if (!profile) {
    return clone(profileStore);
  }

  return {
    id: profile.id,
    user: {
      id: profile.userId || authUser?.id || profileStore.user.id,
      name: authUser?.name || profileStore.user.name,
      email: authUser?.email || profileStore.user.email,
      careerTarget: profile.careerGoal || profile.careerGoalRef?.title || profileStore.user.careerTarget,
    },
    skills: (payload.skills || []).map((skill) => ({
      id: skill.id,
      skillId: skill.skillId,
      name: skill.name,
      level: skill.level,
    })),
    certificates: payload.certifications || [],
    goals: profileStore.goals,
    overallProgress: profile.progressPercent || 0,
  };
};

const loadProfileFromApi = async () => {
  const payload = await request('/profile/me');
  profileStore = toUiProfile(payload);
  return clone(profileStore);
};

export async function createLearningProfile(testResult) {
  try {
    const assessmentResultId = testResult?.id || testResult?.result?.id;
    if (assessmentResultId) {
      await request('/recommendations/roadmap', {
        method: 'POST',
        body: JSON.stringify({ assessmentResultId }),
      });
      return loadProfileFromApi();
    }
  } catch (_error) {
    // Mock fallback keeps the prototype usable when roadmap initialization is unavailable.
  }

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

export async function getLearningProfile() {
  try {
    return await loadProfileFromApi();
  } catch (_error) {
    await delay();
    return clone(profileStore);
  }
}

export async function updateLearningProfile(profileId, payload) {
  try {
    const response = await request('/profile/me', {
      method: 'PATCH',
      body: JSON.stringify({
        careerGoal: payload.user?.careerTarget,
        headline: payload.headline,
        bio: payload.bio,
      }),
    });
    profileStore = {
      ...profileStore,
      user: {
        ...profileStore.user,
        careerTarget: response.profile?.careerGoal || payload.user?.careerTarget || profileStore.user.careerTarget,
      },
      overallProgress: response.profile?.progressPercent ?? profileStore.overallProgress,
    };
    return clone(profileStore);
  } catch (_error) {
    // Fall through to local mock mutation.
  }

  await delay();
  if (profileStore.id !== profileId) {
    throw new Error('Learning profile not found.');
  }
  profileStore = {
    ...profileStore,
    ...payload,
    user: { ...profileStore.user, ...(payload.user || {}) },
  };
  return clone(profileStore);
}

export async function addSkill(profileId, skill) {
  try {
    if (skill.skillId) {
      const response = await request('/profile/me/skills', {
        method: 'PUT',
        body: JSON.stringify({
          skills: [
            ...profileStore.skills.map((item) => ({
              skillId: item.skillId,
              level: item.level,
              source: 'MANUAL',
            })),
            {
              skillId: skill.skillId,
              level: Number(skill.level) || 0,
              source: 'MANUAL',
            },
          ].filter((item) => item.skillId),
        }),
      });
      profileStore = {
        ...profileStore,
        skills: response.skills.map((item) => ({
          id: item.id,
          skillId: item.skillId,
          name: item.name,
          level: item.level,
        })),
      };
      return clone(profileStore);
    }
  } catch (_error) {
    // Ad-hoc skill names without a backend skillId stay local.
  }

  await delay();
  if (profileStore.id !== profileId) {
    throw new Error('Learning profile not found.');
  }
  profileStore.skills = [...profileStore.skills, { ...skill, level: Number(skill.level) || 0 }];
  return clone(profileStore);
}

export async function addCertificate(profileId, certificate) {
  try {
    const response = await request('/profile/me/certifications', {
      method: 'POST',
      body: JSON.stringify({
        name: certificate.name,
        issuer: certificate.issuer || 'Self Learning',
        issuedAt: certificate.issuedAt || new Date().toISOString().slice(0, 10),
      }),
    });
    profileStore = {
      ...profileStore,
      certificates: [...profileStore.certificates, response.certification],
    };
    return clone(profileStore);
  } catch (_error) {
    // Fall through to local mock mutation.
  }

  await delay();
  if (profileStore.id !== profileId) {
    throw new Error('Learning profile not found.');
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
    throw new Error('Learning profile not found.');
  }
  profileStore.goals = profileStore.goals.map((goal) => (goal.id === goalId ? { ...goal, status } : goal));
  return clone(profileStore);
}
