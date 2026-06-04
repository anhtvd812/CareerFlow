import { roadmap } from '../data/mockData';
import { clone, delay } from '../utils/mockApi';
import { getCurrentUserId, request } from './apiClient';

let roadmapStore = clone(roadmap);

const flattenTasks = (roadmapValue) => roadmapValue.stages.flatMap((stage) => stage.tasks);

const toUiProgress = (payload) => ({
  completionRate: payload.completionRate,
  completed: payload.completedTasks ?? payload.completed ?? 0,
  inProgress: payload.inProgressTasks ?? payload.inProgress ?? 0,
  notStarted: payload.notStartedTasks ?? payload.notStarted ?? 0,
  total: payload.totalTasks ?? payload.total ?? 0,
  stages: payload.stages || [],
});

export async function getRoadmap(userId) {
  try {
    const params = new URLSearchParams({ userId: userId === 'user_001' ? getCurrentUserId() : userId || getCurrentUserId() });
    const payload = await request(`/roadmap?${params.toString()}`);
    roadmapStore = payload;
    return clone(roadmapStore);
  } catch (_error) {
    await delay();
    return clone(roadmapStore);
  }
}

export async function recommendRoadmap(userId, careerTarget, currentSkills, missingSkills) {
  try {
    const response = await request('/recommendations/roadmap', {
      method: 'POST',
      body: JSON.stringify({
        currentLevel: careerTarget,
        currentSkills,
        userId: userId || getCurrentUserId(),
      }),
    });
    return response;
  } catch (_error) {
    await delay();
    return {
      userId,
      careerTarget,
      focusSkills: missingSkills.map((skill) => skill.name),
      currentSkills,
      roadmap: clone(roadmapStore),
    };
  }
}

export async function updateTaskStatus(roadmapId, taskId, status) {
  try {
    await request(`/roadmap/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return getRoadmap(getCurrentUserId());
  } catch (_error) {
    await delay();
    if (roadmapStore.id !== roadmapId) {
      throw new Error('Roadmap not found.');
    }
    roadmapStore = {
      ...roadmapStore,
      stages: roadmapStore.stages.map((stage) => ({
        ...stage,
        tasks: stage.tasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
      })),
    };
    return clone(roadmapStore);
  }
}

export async function getRoadmapProgress(roadmapId) {
  try {
    const params = new URLSearchParams(roadmapId ? { roadmapId } : { userId: getCurrentUserId() });
    return toUiProgress(await request(`/roadmap/progress?${params.toString()}`));
  } catch (_error) {
    await delay(220);
    if (roadmapStore.id !== roadmapId) {
      return {
        completionRate: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        total: 0,
      };
    }
    const tasks = flattenTasks(roadmapStore);
    const completed = tasks.filter((task) => task.status === 'completed').length;
    const inProgress = tasks.filter((task) => task.status === 'in_progress').length;
    const notStarted = tasks.filter((task) => task.status === 'not_started').length;
    const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
    return { completionRate, completed, inProgress, notStarted, total: tasks.length };
  }
}
