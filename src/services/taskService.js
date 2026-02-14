import axios from 'axios';

// ========== Configuration ==========
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const taskClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ========== Request Interceptor ==========
taskClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========== Response Interceptor ==========
taskClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || 'Request failed';
      
      if (error.response.status === 401) {
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
      
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Network error - please check your connection');
    } else {
      throw error;
    }
  }
);

// ========== Task Functions ==========

/**
 * Get all tasks (Admin/Manager)
 * @param {Object} filters - Filter parameters
 * @returns {Promise} Tasks array
 */
export const getAllTasks = async (filters = {}) => {
  try {
    const params = {};
    
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.assignedTo) params.assignedTo = filters.assignedTo;
    if (filters.category) params.category = filters.category;
    if (filters.search) params.search = filters.search;
    
    const response = await taskClient.get('/admin/tasks', { params });
    return response;
  } catch (error) {
    console.error('Get all tasks error:', error);
    throw error;
  }
};

/**
 * Get my assigned tasks (Employee)
 * @param {Object} filters - Filter parameters
 * @returns {Promise} User's tasks
 */
export const getMyTasks = async (filters = {}) => {
  try {
    const params = {};
    
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    
    const response = await taskClient.get('/tasks/my-tasks', { params });
    return response;
  } catch (error) {
    console.error('Get my tasks error:', error);
    throw error;
  }
};

/**
 * Get single task by ID
 * @param {string} id - Task ID
 * @returns {Promise} Task details
 */
export const getTask = async (id) => {
  try {
    const response = await taskClient.get(`/tasks/${id}`);
    return response;
  } catch (error) {
    console.error('Get task error:', error);
    throw error;
  }
};

/**
 * Create new task (Admin/Manager)
 * @param {Object} taskData - Task data
 * @returns {Promise} Created task
 */
export const createTask = async (taskData) => {
  try {
    const response = await taskClient.post('/admin/assignTask', taskData);
    return response;
  } catch (error) {
    console.error('Create task error:', error);
    throw error;
  }
};

/**
 * Update task (Admin/Manager)
 * @param {string} id - Task ID
 * @param {Object} taskData - Updated data
 * @returns {Promise} Updated task
 */
export const updateTask = async (id, taskData) => {
  try {
    const response = await taskClient.put(`/tasks/${id}`, taskData);
    return response;
  } catch (error) {
    console.error('Update task error:', error);
    throw error;
  }
};

/**
 * Update task status (Employee or Admin/Manager)
 * @param {string} id - Task ID
 * @param {string} status - New status
 * @returns {Promise} Updated task
 */
export const updateTaskStatus = async (id, status) => {
  try {
    const response = await taskClient.patch(`/tasks/${id}/status`, { status });
    return response;
  } catch (error) {
    console.error('Update task status error:', error);
    throw error;
  }
};

/**
 * Delete task (Admin/Manager)
 * @param {string} id - Task ID
 * @returns {Promise} Delete result
 */
export const deleteTask = async (id) => {
  try {
    const response = await taskClient.delete(`/tasks/${id}`);
    return response;
  } catch (error) {
    console.error('Delete task error:', error);
    throw error;
  }
};

/**
 * Bulk assign tasks (Admin/Manager)
 * @param {Array} tasks - Array of task data
 * @returns {Promise} Created tasks
 */
export const bulkAssignTasks = async (tasks) => {
  try {
    const response = await taskClient.post('/admin/tasks/bulk-assign', { tasks });
    return response;
  } catch (error) {
    console.error('Bulk assign tasks error:', error);
    throw error;
  }
};

/**
 * Get task statistics (Admin/Manager)
 * @param {Object} params - Query parameters
 * @returns {Promise} Statistics data
 */
export const getTaskStats = async (params = {}) => {
  try {
    const response = await taskClient.get('/admin/tasks/stats', { params });
    return response;
  } catch (error) {
    console.error('Get task stats error:', error);
    throw error;
  }
};

// ========== Export axios instance ==========
export { taskClient };

// ========== Default export ==========
export default {
  getAllTasks,
  getMyTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  bulkAssignTasks,
  getTaskStats,
};