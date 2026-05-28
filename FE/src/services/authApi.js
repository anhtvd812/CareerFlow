const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
};

export async function loginUser(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(name, email, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}
