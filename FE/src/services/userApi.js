import { getCurrentUserId, request } from './apiClient';

export async function getUserAssessmentHistory(userId) {
  const resolvedUserId = userId || getCurrentUserId();
  if (!resolvedUserId) {
    return [];
  }
  const data = await request(`/users/${resolvedUserId}/assessments`);
  return data?.results || [];
}
