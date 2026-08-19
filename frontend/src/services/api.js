import axios from 'axios';

// ========================================
// CONFIGURATION
// ========================================
const REAL_API_URL = 'http://localhost:8080/api';
const MOCK_API_URL = 'http://localhost:5000';

// ========================================
// MOCK DATA
// ========================================
let mockData = {
  users: [
    { id: 1, email: 'test@email.com', name: 'Test User', password: '123456' }
  ],
  projects: [
    {
      id: 1,
      name: 'Travel Website',
      description: 'A complete travel booking platform',
      user_id: 1,
      status: 'ENDED',
      progress: 100,
      totalTasks: 2,
      completedTasks: 2,
      tasks: [
        { id: 1, title: 'home page', description: 'Design home page', dueDate: '2026-08-27', completed: true, priority: 'MEDIUM', project_id: 1 },
        { id: 2, title: 'contact page', description: 'Create contact form', dueDate: '2026-08-29', completed: false, priority: 'MEDIUM', project_id: 1 }
      ]
    },
    {
      id: 2,
      name: 'Home Project',
      description: 'Personal home renovation',
      user_id: 1,
      status: 'RUNNING',
      progress: 0,
      totalTasks: 1,
      completedTasks: 0,
      tasks: [
        { id: 3, title: 'create frontend', description: 'Build React frontend', dueDate: '2026-08-13', completed: false, priority: 'HIGH', project_id: 2 }
      ]
    }
  ],
  tasks: [
    { id: 1, title: 'home page', description: 'Design home page', dueDate: '2026-08-27', completed: true, priority: 'MEDIUM', project_id: 1 },
    { id: 2, title: 'contact page', description: 'Create contact form', dueDate: '2026-08-29', completed: false, priority: 'MEDIUM', project_id: 1 },
    { id: 3, title: 'create frontend', description: 'Build React frontend', dueDate: '2026-08-13', completed: false, priority: 'HIGH', project_id: 2 }
  ],
  comments: [
    { id: 1, content: 'Great job!', task_id: 1, user_id: 1, userName: 'Test User' }
  ]
};

// ========================================
// CHECK BACKEND STATUS
// ========================================
let isBackendRunning = false;
let isChecked = false;

const checkBackend = async () => {
  if (isChecked) return isBackendRunning;
  isChecked = true;
  
  try {
    const response = await axios.get(`${REAL_API_URL}/auth/check`, { timeout: 2000 });
    isBackendRunning = response.status === 200;
    console.log(`🔌 Backend ${isBackendRunning ? '✅ RUNNING' : '❌ NOT RUNNING'} - Using ${isBackendRunning ? 'REAL' : 'MOCK'} API`);
    return isBackendRunning;
  } catch (error) {
    isBackendRunning = false;
    console.log('🔌 Backend NOT RUNNING - Using MOCK API');
    return false;
  }
};

// ========================================
// CREATE API INSTANCE
// ========================================
const getApi = async () => {
  await checkBackend();
  const BASE_URL = isBackendRunning ? REAL_API_URL : MOCK_API_URL;
  
  const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
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

  return api;
};

// ========================================
// MOCK API HANDLERS
// ========================================
const mockHandlers = {
  // ===== AUTH =====
  register: (data) => {
    const user = { ...data, id: Date.now() };
    mockData.users.push(user);
    return { data: 'User registered successfully' };
  },
  
  login: (data) => {
    const user = mockData.users.find(u => u.email === data.email && u.password === data.password);
    if (!user) {
      const error = new Error('Invalid credentials');
      error.response = { data: 'Invalid credentials' };
      throw error;
    }
    return {
      data: {
        token: 'mock-token-' + Date.now(),
        email: user.email,
        name: user.name
      }
    };
  },

  // ===== PROJECTS =====
  getProjects: () => {
    return { data: mockData.projects };
  },
  
  createProject: (data) => {
    const project = {
      ...data,
      id: Date.now(),
      user_id: 1,
      status: 'PENDING',
      progress: 0,
      totalTasks: 0,
      completedTasks: 0,
      tasks: []
    };
    mockData.projects.push(project);
    return { data: project };
  },
  
  updateProject: (id, data) => {
    const index = mockData.projects.findIndex(p => p.id === id);
    if (index === -1) {
      const error = new Error('Project not found');
      error.response = { data: 'Project not found' };
      throw error;
    }
    mockData.projects[index] = { ...mockData.projects[index], ...data };
    return { data: mockData.projects[index] };
  },
  
  deleteProject: (id) => {
    mockData.projects = mockData.projects.filter(p => p.id !== id);
    return { data: 'Deleted' };
  },

  // ===== TASKS =====
  getTasksByProject: (projectId) => {
    const tasks = mockData.tasks.filter(t => t.project_id === parseInt(projectId));
    return { data: tasks };
  },
  
  createTask: (data) => {
    const task = {
      ...data,
      id: Date.now(),
      project_id: data.project.id
    };
    mockData.tasks.push(task);
    updateProjectStats(task.project_id);
    return { data: task };
  },
  
  updateTask: (id, data) => {
    const index = mockData.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      const error = new Error('Task not found');
      error.response = { data: 'Task not found' };
      throw error;
    }
    mockData.tasks[index] = { ...mockData.tasks[index], ...data };
    updateProjectStats(mockData.tasks[index].project_id);
    return { data: mockData.tasks[index] };
  },
  
  toggleTask: (id) => {
    const index = mockData.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      const error = new Error('Task not found');
      error.response = { data: 'Task not found' };
      throw error;
    }
    mockData.tasks[index].completed = !mockData.tasks[index].completed;
    updateProjectStats(mockData.tasks[index].project_id);
    return { data: mockData.tasks[index] };
  },
  
  deleteTask: (id) => {
    const task = mockData.tasks.find(t => t.id === id);
    if (task) {
      mockData.tasks = mockData.tasks.filter(t => t.id !== id);
      updateProjectStats(task.project_id);
    }
    return { data: 'Deleted' };
  },

  // ===== COMMENTS =====
  getComments: (taskId) => {
    const comments = mockData.comments.filter(c => c.task_id === parseInt(taskId));
    return { data: comments };
  },
  
  createComment: (data) => {
    const comment = {
      ...data,
      id: Date.now(),
      user_id: 1,
      userName: 'Test User'
    };
    mockData.comments.push(comment);
    return { data: comment };
  },
  
  deleteComment: (id) => {
    mockData.comments = mockData.comments.filter(c => c.id !== id);
    return { data: 'Deleted' };
  }
};

// ========================================
// UPDATE PROJECT STATS HELPER
// ========================================
function updateProjectStats(projectId) {
  const project = mockData.projects.find(p => p.id === projectId);
  if (!project) return;
  
  const tasks = mockData.tasks.filter(t => t.project_id === projectId);
  project.totalTasks = tasks.length;
  project.completedTasks = tasks.filter(t => t.completed).length;
  project.progress = project.totalTasks > 0 ? (project.completedTasks / project.totalTasks) * 100 : 0;
  project.status = project.progress === 100 ? 'ENDED' : project.progress > 0 ? 'RUNNING' : 'PENDING';
}

// ========================================
// WRAPPER FUNCTION - SMART API CALL
// ========================================
const smartCall = async (mockFn, realFn) => {
  await checkBackend();
  
  if (isBackendRunning) {
    try {
      const api = await getApi();
      const result = await realFn(api);
      return result;
    } catch (error) {
      console.warn('⚠️ Backend failed, falling back to mock');
      return mockFn();
    }
  }
  return mockFn();
};

// ========================================
// AUTH API
// ========================================
export const authAPI = {
  register: (data) => smartCall(
    () => mockHandlers.register(data),
    (api) => api.post('/auth/register', data)
  ),
  login: (data) => smartCall(
    () => mockHandlers.login(data),
    (api) => api.post('/auth/login', data)
  ),
};

// ========================================
// PROJECT API
// ========================================
export const projectAPI = {
  getAll: () => smartCall(
    () => mockHandlers.getProjects(),
    (api) => api.get('/projects')
  ),
  create: (data) => smartCall(
    () => mockHandlers.createProject(data),
    (api) => api.post('/projects', data)
  ),
  update: (id, data) => smartCall(
    () => mockHandlers.updateProject(id, data),
    (api) => api.put(`/projects/${id}`, data)
  ),
  delete: (id) => smartCall(
    () => mockHandlers.deleteProject(id),
    (api) => api.delete(`/projects/${id}`)
  ),
};

// ========================================
// TASK API
// ========================================
export const taskAPI = {
  getByProject: (projectId) => smartCall(
    () => mockHandlers.getTasksByProject(projectId),
    (api) => api.get(`/tasks/project/${projectId}`)
  ),
  create: (data) => smartCall(
    () => mockHandlers.createTask(data),
    (api) => api.post('/tasks', data)
  ),
  update: (id, data) => smartCall(
    () => mockHandlers.updateTask(id, data),
    (api) => api.put(`/tasks/${id}`, data)
  ),
  toggle: (id) => smartCall(
    () => mockHandlers.toggleTask(id),
    (api) => api.patch(`/tasks/${id}/toggle`)
  ),
  delete: (id) => smartCall(
    () => mockHandlers.deleteTask(id),
    (api) => api.delete(`/tasks/${id}`)
  ),
};

// ========================================
// COMMENT API
// ========================================
export const commentAPI = {
  getByTask: (taskId) => smartCall(
    () => mockHandlers.getComments(taskId),
    (api) => api.get(`/comments/task/${taskId}`)
  ),
  create: (data) => smartCall(
    () => mockHandlers.createComment(data),
    (api) => api.post('/comments', data)
  ),
  delete: (id) => smartCall(
    () => mockHandlers.deleteComment(id),
    (api) => api.delete(`/comments/${id}`)
  ),
};

// ========================================
// DEFAULT EXPORT - FIXED
// ========================================
const apiService = { authAPI, projectAPI, taskAPI, commentAPI };
export default apiService;