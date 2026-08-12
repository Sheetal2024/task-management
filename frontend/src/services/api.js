import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
};

export const projectAPI = {
  getAll: () => api.get('/projects'),
  create: (projectData) => api.post('/projects', projectData),
  update: (id, projectData) => api.put(`/projects/${id}`, projectData),
  delete: (id) => api.delete(`/projects/${id}`),
};

export const taskAPI = {
  getByProject: (projectId) => api.get(`/tasks/project/${projectId}`),
  create: (taskData) => api.post('/tasks', taskData),
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  toggle: (id) => api.patch(`/tasks/${id}/toggle`),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export const commentAPI = {
  getByTask: (taskId) => api.get(`/comments/task/${taskId}`),
  create: (commentData) => api.post('/comments', commentData),
  delete: (id) => api.delete(`/comments/${id}`),
};

// ✅ ATTACHMENT API
export const attachmentAPI = {
  getByTask: (taskId) => api.get(`/attachments/task/${taskId}`),
  upload: (taskId, formData) => api.post(`/attachments/upload/${taskId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  delete: (id) => api.delete(`/attachments/${id}`),
};

export default api;