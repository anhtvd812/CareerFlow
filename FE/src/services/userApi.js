const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('authToken');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) },
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
};

export async function getUserAssessmentHistory(userId) {
  const data = await request(`/users/${userId}/assessments`);
  return data?.results || [];
}
