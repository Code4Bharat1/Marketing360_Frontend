// services/projectTimeLogService.js
import api from '../lib/axios';

const projectTimeLogService = {
  // Get all time logs
  getTimeLogs: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/project-timelogs?${params}`);
    return response.data;
  },

  // Get time log by ID
  getTimeLogById: async (id) => {
    const response = await api.get(`/project-timelogs/${id}`);
    return response.data;
  },

  // Create time log
  createTimeLog: async (timeLogData) => {
    const response = await api.post('/project-timelogs', timeLogData);
    return response.data;
  },

  // Update time log
  updateTimeLog: async (id, timeLogData) => {
    const response = await api.put(`/project-timelogs/${id}`, timeLogData);
    return response.data;
  },

  // Delete time log
  deleteTimeLog: async (id) => {
    const response = await api.delete(`/project-timelogs/${id}`);
    return response.data;
  },

  // Approve time log
  approveTimeLog: async (id) => {
    const response = await api.put(`/project-timelogs/${id}/approve`);
    return response.data;
  },

  // Reject time log
  rejectTimeLog: async (id, rejectionReason) => {
    const response = await api.put(`/project-timelogs/${id}/reject`, { rejectionReason });
    return response.data;
  },

  // Get project time logs
  getProjectTimeLogs: async (projectId, filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/project-timelogs/project/${projectId}?${params}`);
    return response.data;
  },

  // Get employee time logs
  getEmployeeTimeLogs: async (employeeId, filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/project-timelogs/employee/${employeeId}?${params}`);
    return response.data;
  },

  // Get employee project time stats
  getEmployeeProjectTimeStats: async (projectId, employeeId) => {
    const response = await api.get(`/project-timelogs/stats/${projectId}/${employeeId}`);
    return response.data;
  },
};

export default projectTimeLogService;