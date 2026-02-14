import api from '../lib/axios';

// Get all users with filters and pagination
export const getAllUsers = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.role) params.append('role', filters.role);
    if (filters.department) params.append('department', filters.department);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await api.get(`/users?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Search users
export const searchUsers = async (query, filters = {}) => {
  try {
    const params = new URLSearchParams({ q: query });
    
    if (filters.role) params.append('role', filters.role);
    if (filters.department) params.append('department', filters.department);
    if (filters.status) params.append('status', filters.status);
    
    const response = await api.get(`/users/search?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user statistics
export const getUserStatistics = async () => {
  try {
    const response = await api.get('/users/statistics');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get single user by ID
export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user by email
export const getUserByEmail = async (email) => {
  try {
    const response = await api.get(`/users/email/${email}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get users by role
export const getUsersByRole = async (role) => {
  try {
    const response = await api.get(`/users/role/${role}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get users by department
export const getUsersByDepartment = async (department) => {
  try {
    const response = await api.get(`/users/department/${department}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get users by status
export const getUsersByStatus = async (status) => {
  try {
    const response = await api.get(`/users/status/${status}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user status
export const updateUserStatus = async (id, status) => {
  try {
    const response = await api.patch(`/users/${id}/status`, { Status: status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete user
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Bulk update users
export const bulkUpdateUsers = async (userIds, updateData) => {
  try {
    const response = await api.post('/users/bulk-update', {
      userIds,
      updateData
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};