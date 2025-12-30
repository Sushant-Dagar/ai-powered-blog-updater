import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchArticles = async () => {
  const response = await api.get('/articles');
  return response.data.data;
};

export const fetchArticle = async (id) => {
  const response = await api.get(`/articles/${id}`);
  return response.data.data;
};

export default api;
