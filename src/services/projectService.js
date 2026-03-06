// services/projectService.js
import api from '../lib/axios';

const projectService = {
  // Get all projects (Admin)
  getProjects: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/projects?${params}`);
    return response.data;
  },

  // Get single project
  getProjectById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // Create project
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  // Update project
  updateProject: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  // Delete project
  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  // Assign employee to project
  assignEmployee: async (projectId, employeeData) => {
    const response = await api.post(`/projects/${projectId}/assign-employee`, employeeData);
    return response.data;
  },

  // Remove employee from project
  removeEmployee: async (projectId, employeeId) => {
    const response = await api.delete(`/projects/${projectId}/remove-employee/${employeeId}`);
    return response.data;
  },

  // Update employee in project
  updateEmployee: async (projectId, employeeId, employeeData) => {
    const response = await api.put(`/projects/${projectId}/update-employee/${employeeId}`, employeeData);
    return response.data;
  },

  // Get project statistics
  getProjectStatistics: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/statistics`);
    return response.data;
  },

  // Get employee projects (using employeeId - for Admin)
  getEmployeeProjects: async (employeeId) => {
    const response = await api.get(`/projects/employee/${employeeId}`);
    return response.data;
  },

  // Get current logged-in employee's projects (NEW - Recommended)
  getMyProjects: async () => {
    const response = await api.get(`/projects/my-projects`);
    return response.data;
  },
};

export default projectService;