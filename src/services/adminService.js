import api from '../lib/axios';

// ========== Helper Functions ==========
const handleApiResponse = (response) => {
  return response.data;
};

const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error status
    throw {
      success: false,
      message: error.response.data?.message || 'Server error occurred',
      statusCode: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // Request made but no response
    throw {
      success: false,
      message: 'No response from server. Please check your connection.',
      statusCode: 0
    };
  } else {
    // Something else happened
    throw {
      success: false,
      message: error.message || 'An unexpected error occurred',
      statusCode: 0
    };
  }
};

// ========== Dashboard Statistics ==========
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/dashboard/stats');
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

// ========== Employee Management ==========

/**
 * Get all employees with optional filters
 * @param {Object} filters - Filter options
 * @param {string} filters.status - Filter by status (Active/Inactive)
 * @param {string} filters.role - Filter by role/designation
 * @param {string} filters.search - Search term
 * @param {string} filters.department - Filter by department
 */
export const getAllEmployees = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.role) params.append('role', filters.role);
    if (filters.search) params.append('search', filters.search);
    if (filters.department) params.append('department', filters.department);
    
    const response = await api.get(`/admin/employees?${params.toString()}`);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get a single employee by ID
 * @param {string} id - Employee ID
 */
export const getEmployee = async (id) => {
  try {
    const response = await api.get(`/admin/employees/${id}`);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Create a new employee
 * @param {Object} employeeData - Employee information
 * @param {string} employeeData.name - Full name
 * @param {string} employeeData.email - Email address
 * @param {string} employeeData.phoneNumber - Phone number
 * @param {string} employeeData.Location - Location/city
 * @param {string} employeeData.role - Job role/designation
 * @param {string} employeeData.department - Department
 * @param {string} employeeData.shiftName - Shift type
 * @param {string} employeeData.joiningDate - Joining date
 * @param {string} employeeData.assignedStartTime - Shift start time
 * @param {string} employeeData.assignedEndTime - Shift end time
 * @param {string} employeeData.Status - Active/Inactive
 * @param {string} employeeData.managerName - Manager name (optional)
 */
export const createEmployee = async (employeeData) => {
  try {
    const response = await api.post('/admin/createEmployee', employeeData);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update an existing employee
 * @param {string} id - Employee ID
 * @param {Object} employeeData - Updated employee information
 */
export const updateEmployee = async (id, employeeData) => {
  try {
    const response = await api.put(`/admin/employees/${id}`, employeeData);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete an employee
 * @param {string} id - Employee ID
 */
export const deleteEmployee = async (id) => {
  try {
    const response = await api.delete(`/admin/employees/${id}`);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get employee statistics
 */
export const getEmployeeStats = async () => {
  try {
    const response = await api.get('/admin/employees/stats');
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Bulk update employee status
 * @param {Array<string>} employeeIds - Array of employee IDs
 * @param {string} status - New status (Active/Inactive)
 */
export const bulkUpdateEmployeeStatus = async (employeeIds, status) => {
  try {
    const response = await api.put('/admin/employees/bulk-status', { 
      employeeIds, 
      status 
    });
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

// ========== Task Management ==========

/**
 * Get all tasks with optional filters
 * @param {Object} filters - Filter options
 * @param {string} filters.status - Filter by status
 * @param {string} filters.priority - Filter by priority
 * @param {string} filters.assignedTo - Filter by assigned employee
 */
export const getAllTasks = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
    
    const response = await api.get(`/admin/tasks?${params.toString()}`);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Assign a new task
 * @param {Object} taskData - Task information
 * @param {string} taskData.title - Task title
 * @param {string} taskData.description - Task description
 * @param {string} taskData.priority - Priority (Low/Medium/High)
 * @param {string} taskData.category - Category
 * @param {string} taskData.dueDate - Due date
 * @param {string} taskData.assignedTo - Employee ID to assign to
 * @param {number} taskData.estimatedTime - Estimated time in hours
 */
export const assignTask = async (taskData) => {
  try {
    const response = await api.post('/admin/assignTask', taskData);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update an existing task
 * @param {string} id - Task ID
 * @param {Object} taskData - Updated task information
 */
export const updateTask = async (id, taskData) => {
  try {
    const response = await api.put(`/admin/tasks/${id}`, taskData);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete a task
 * @param {string} id - Task ID
 */
export const deleteTask = async (id) => {
  try {
    const response = await api.delete(`/admin/tasks/${id}`);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

// ========== Work Log Management ==========

/**
 * Get work logs with optional filters
 * @param {Object} filters - Filter options
 * @param {string} filters.status - Filter by status (pending/approved/rejected)
 * @param {string} filters.employee - Filter by employee ID
 * @param {string} filters.startDate - Filter by start date
 * @param {string} filters.endDate - Filter by end date
 */
export const getWorkLogs = async (filters = {}) => {
  try {
    const response = await api.get('/admin/worklogs', { params: filters });
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update work log status
 * @param {string} logId - Work log ID
 * @param {string} status - New status (pending/approved/rejected)
 */
export const updateWorkLogStatus = async (logId, status) => {
  try {
    const response = await api.put(`/admin/worklogs/${logId}/status`, { status });
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get a single work log by ID
 * @param {string} logId - Work log ID
 */
export const getWorkLogById = async (logId) => {
  try {
    const response = await api.get(`/admin/worklogs/${logId}`);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete a work log
 * @param {string} logId - Work log ID
 */
export const deleteWorkLog = async (logId) => {
  try {
    const response = await api.delete(`/admin/worklogs/${logId}`);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Bulk update work log status
 * @param {Array<string>} workLogIds - Array of work log IDs
 * @param {string} status - New status (pending/approved/rejected)
 */
export const bulkUpdateWorkLogStatus = async (workLogIds, status) => {
  try {
    const response = await api.put('/admin/worklogs/bulk-status', { 
      workLogIds, 
      status 
    });
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

// ========== Export all functions ==========
export default {
  // Dashboard
  getDashboardStats,
  
  // Employees
  getAllEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
  bulkUpdateEmployeeStatus,
  
  // Tasks
  getAllTasks,
  assignTask,
  updateTask,
  deleteTask,
  
  // Work Logs
  getWorkLogs,
  updateWorkLogStatus,
  getWorkLogById,
  deleteWorkLog,
  bulkUpdateWorkLogStatus,
};