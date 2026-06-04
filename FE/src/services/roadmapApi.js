import { roadmap } from '../data/mockData';
import { clone, delay } from '../utils/mockApi';

let roadmapStore = clone(roadmap);

const flattenTasks = (roadmapValue) => roadmapValue.stages.flatMap((stage) => stage.tasks);

export async function getRoadmap(userId) {
  await delay();
  if (roadmapStore.userId !== userId) {
    throw new Error('Không tìm thấy lộ trình.');
  }
  return clone(roadmapStore);
}

export async function recommendRoadmap(userId, careerTarget, currentSkills, missingSkills) {
  await delay();
  return {
    userId,
    careerTarget,
    focusSkills: missingSkills.map((skill) => skill.name),
    currentSkills,
    roadmap: clone(roadmapStore),
  };
}

export async function updateTaskStatus(roadmapId, taskId, status) {
  await delay();
  if (roadmapStore.id !== roadmapId) {
    throw new Error('Không tìm thấy lộ trình.');
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

export async function getRoadmapProgress(roadmapId) {
  await delay(220);
  if (roadmapStore.id !== roadmapId) {
    throw new Error('Không tìm thấy lộ trình.');
  }
  const tasks = flattenTasks(roadmapStore);
  const completed = tasks.filter((task) => task.status === 'completed').length;
  const inProgress = tasks.filter((task) => task.status === 'in_progress').length;
  const notStarted = tasks.filter((task) => task.status === 'not_started').length;
  const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  return { completionRate, completed, inProgress, notStarted, total: tasks.length };
}
