import api from './axios';

export async function createChat({ title }) {
  const { data } = await api.post('/api/chats', { title });
  return data;
}

export async function getChats() {
  const { data } = await api.get('/api/chats');
  return data;
}