import api from './axios';

export async function registerUser({ firstName, lastName, email, password }) {
  const { data } = await api.post('/api/auth/register', {
    fullName: { firstName, lastName },
    email,
    password,
  });
  return data;
}

export async function loginUser({ email, password }) {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data;
}
