import axios from 'axios';

// ========== Configuration ==========
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const workLogClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ========== Request Interceptor ==========
workLogClient.interceptors.request.use(
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
workLogClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || 'Request failed';
      
      if (error.response.status === 401) {
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/')) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/';
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

// ========== Work Log Functions ==========

/**
 * Get all work logs (Admin/Manager)
 * @param {Object} filters - Filter parameters
 * @returns {Promise} Work logs array
 */
export const getAllWorkLogs = async (filters = {}) => {
  try {
    const params = {};
    
    if (filters.status) params.status = filters.status;
    if (filters.employee) params.employee = filters.employee;
    if (filters.department) params.department = filters.department;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    
    const response = await workLogClient.get('/worklogs', { params });
    return response;
  } catch (error) {
    console.error('Get all work logs error:', error);
    throw error;
  }
};

/**
 * Get my work logs (Employee)
 * @param {Object} filters - Filter parameters
 * @returns {Promise} User's work logs
 */
export const getMyWorkLogs = async (filters = {}) => {
  try {
    const params = {};
    
    if (filters.status) params.status = filters.status;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    
    const response = await workLogClient.get('/worklogs/my-logs', { params });
    return response;
  } catch (error) {
    console.error('Get my work logs error:', error);
    throw error;
  }
};

/**
 * Get single work log by ID
 * @param {string} id - Work log ID
 * @returns {Promise} Work log details
 */
export const getWorkLog = async (id) => {
  try {
    const response = await workLogClient.get(`/worklogs/${id}`);
    return response;
  } catch (error) {
    console.error('Get work log error:', error);
    throw error;
  }
};

/**
 * Submit new work log (Employee)
 * @param {Object} workLogData - Work log data
 * @returns {Promise} Created work log
 */
export const submitWorkLog = async (workLogData) => {
  try {
    const response = await workLogClient.post('/worklogs', workLogData);
    return response;
  } catch (error) {
    console.error('Submit work log error:', error);
    throw error;
  }
};

/**
 * Update work log (Employee - pending only)
 * @param {string} id - Work log ID
 * @param {Object} workLogData - Updated data
 * @returns {Promise} Updated work log
 */
export const updateWorkLog = async (id, workLogData) => {
  try {
    const response = await workLogClient.put(`/worklogs/${id}`, workLogData);
    return response;
  } catch (error) {
    console.error('Update work log error:', error);
    throw error;
  }
};

/**
 * Approve or reject work log (Admin/Manager)
 * @param {string} id - Work log ID
 * @param {string} status - 'approved' or 'rejected'
 * @param {string} rejectionReason - Optional rejection reason
 * @returns {Promise} Updated work log
 */
export const updateWorkLogStatus = async (id, status, rejectionReason = null) => {
  try {
    const payload = { status };
    if (rejectionReason) {
      payload.rejectionReason = rejectionReason;
    }
    
    const response = await workLogClient.patch(`/worklogs/${id}/status`, payload);
    return response;
  } catch (error) {
    console.error('Update work log status error:', error);
    throw error;
  }
};

/**
 * Bulk update work log statuses (Admin/Manager)
 * @param {string[]} ids - Array of work log IDs
 * @param {string} status - 'approved' or 'rejected'
 * @returns {Promise} Update result
 */
export const bulkUpdateWorkLogStatus = async (ids, status) => {
  try {
    const response = await workLogClient.patch('/worklogs/bulk-status', {
      workLogIds: ids,
      status
    });
    return response;
  } catch (error) {
    console.error('Bulk update work log status error:', error);
    throw error;
  }
};

/**
 * Delete work log
 * @param {string} id - Work log ID
 * @returns {Promise} Delete result
 */
export const deleteWorkLog = async (id) => {
  try {
    const response = await workLogClient.delete(`/worklogs/${id}`);
    return response;
  } catch (error) {
    console.error('Delete work log error:', error);
    throw error;
  }
};

/**
 * Get work log statistics (Admin/Manager)
 * @param {Object} params - Query parameters (startDate, endDate)
 * @returns {Promise} Statistics data
 */
export const getWorkLogStats = async (params = {}) => {
  try {
    const response = await workLogClient.get('/worklogs/stats', { params });
    return response;
  } catch (error) {
    console.error('Get work log stats error:', error);
    throw error;
  }
};

// ========== Export axios instance ==========
export { workLogClient };

// ========== Default export ==========
export default {
  getAllWorkLogs,
  getMyWorkLogs,
  getWorkLog,
  submitWorkLog,
  updateWorkLog,
  updateWorkLogStatus,
  bulkUpdateWorkLogStatus,
  deleteWorkLog,
  getWorkLogStats,
};