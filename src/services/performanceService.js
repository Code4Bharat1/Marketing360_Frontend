// services/performanceService.js
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Adjust based on your token storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
     localStorage.removeItem('authToken');
        localStorage.removeItem('user')
      window.location.href = '/login';
    }
    
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==================== PERFORMANCE SERVICES ====================

/**
 * Calculate performance for an employee
 * @param {string} employeeId - Employee ID
 * @param {string} period - Time period (daily, weekly, monthly, quarterly, yearly)
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 */
export const calculatePerformance = async (employeeId, period, startDate, endDate) => {
  try {
    const response = await api.post('/performance/calculate', {
      employeeId,
      period,
      startDate,
      endDate,
    });
    return response.data;
  } catch (error) {
    console.error('Error calculating performance:', error);
    throw error;
  }
};

/**
 * Get performance statistics
 * @param {string} period - Time period (monthly, quarterly, yearly)
 * @param {string} department - Department filter (all, engineering, management, etc.)
 */
export const getPerformanceStats = async (period = 'monthly', department = 'all') => {
  try {
    const response = await api.get('/performance/stats', {
      params: { period, department }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching performance stats:', error);
    throw error;
  }
};

/**
 * Get top performers
 * @param {string} period - Time period
 * @param {number} limit - Number of top performers
 * @param {string} department - Department filter
 */
export const getTopPerformers = async (period = 'monthly', limit = 5, department = 'all') => {
  try {
    const response = await api.get('/performance/top-performers', {
      params: { period, limit, department }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top performers:', error);
    throw error;
  }
};

/**
 * Get all employees performance
 * @param {object} filters - Filter options
 */
export const getAllPerformances = async (filters = {}) => {
  try {
    const {
      period = 'monthly',
      department = 'all',
      rating,
      sortBy = 'overallScore',
      order = 'desc',
      page = 1,
      limit = 20,
      startDate,
      endDate,
    } = filters;

    const params = {
      period,
      department,
      sortBy,
      order,
      page,
      limit,
    };

    if (rating) params.rating = rating;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get('/performance/all', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all performances:', error);
    throw error;
  }
};

/**
 * Get employee performance history
 * @param {string} employeeId - Employee ID
 * @param {object} filters - Filter options
 */
export const getEmployeePerformance = async (employeeId, filters = {}) => {
  try {
    const { period, startDate, endDate, limit = 10 } = filters;

    const params = { limit };
    
    if (period) params.period = period;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get(`/performance/employee/${employeeId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching employee performance:', error);
    throw error;
  }
};

/**
 * Get performance trends for an employee
 * @param {string} employeeId - Employee ID
 * @param {number} months - Number of months to look back
 */
export const getPerformanceTrends = async (employeeId, months = 6) => {
  try {
    const response = await api.get(`/performance/employee/${employeeId}/trends`, {
      params: { months }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching performance trends:', error);
    throw error;
  }
};

/**
 * Get department-wise performance
 * @param {string} period - Time period
 * @param {string} startDate - Start date (optional)
 * @param {string} endDate - End date (optional)
 */
export const getDepartmentPerformance = async (period = 'monthly', startDate = null, endDate = null) => {
  try {
    const params = { period };
    
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get('/performance/departments', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching department performance:', error);
    throw error;
  }
};

/**
 * Update performance review (manager feedback)
 * @param {string} performanceId - Performance record ID
 * @param {object} reviewData - Review data
 */
export const updatePerformanceReview = async (performanceId, reviewData) => {
  try {
    const response = await api.put(`/performance/review/${performanceId}`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error updating performance review:', error);
    throw error;
  }
};

/**
 * Batch calculate performance for multiple employees
 * @param {array} employeeIds - Array of employee IDs
 * @param {string} period - Time period
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 */
export const batchCalculatePerformance = async (employeeIds, period, startDate, endDate) => {
  try {
    const promises = employeeIds.map(employeeId =>
      calculatePerformance(employeeId, period, startDate, endDate)
        .catch(error => ({ error, employeeId }))
    );
    
    const results = await Promise.allSettled(promises);
    
    return {
      successful: results.filter(r => r.status === 'fulfilled').map(r => r.value),
      failed: results.filter(r => r.status === 'rejected').map(r => r.reason),
    };
  } catch (error) {
    console.error('Error in batch calculate performance:', error);
    throw error;
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get date range for period
 * @param {string} period - week, month, quarter, year
 */
export const getDateRangeForPeriod = (period) => {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case 'daily':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case 'weekly':
    case 'week':
      const dayOfWeek = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'monthly':
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'quarterly':
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'yearly':
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
};

/**
 * Format performance data for display
 */
export const formatPerformanceData = (performance) => {
  if (!performance) return null;

  return {
    id: performance._id,
    employeeId: performance.employee?.id || performance.employee?._id,
    employeeName: performance.employee?.name,
    employeeEmail: performance.employee?.email,
    employeeAvatar: performance.employee?.avatar,
    department: performance.employee?.department,
    overallScore: performance.overallScore || 0,
    rating: performance.rating || 'Average',
    trend: performance.trend || 'stable',
    attendance: performance.attendanceMetrics?.attendancePercentage || 0,
    productivity: performance.productivityMetrics?.productivityScore || 0,
    taskCompletion: performance.taskMetrics?.completionRate || 0,
    avgWorkHours: performance.attendanceMetrics?.avgWorkHours || 0,
    presentDays: performance.attendanceMetrics?.presentDays || 0,
    totalWorkingDays: performance.attendanceMetrics?.totalWorkingDays || 0,
    completedTasks: performance.taskMetrics?.completedTasks || 0,
    totalTasks: performance.taskMetrics?.totalTasks || 0,
    period: performance.period,
    startDate: performance.startDate,
    endDate: performance.endDate,
    calculatedAt: performance.calculatedAt,
    managerNotes: performance.managerNotes,
    strengths: performance.strengths || [],
    areasOfImprovement: performance.areasOfImprovement || [],
  };
};

/**
 * Get performance status color
 */
export const getPerformanceColor = (score) => {
  if (score >= 90) return 'green';
  if (score >= 75) return 'blue';
  if (score >= 60) return 'yellow';
  if (score >= 40) return 'orange';
  return 'red';
};

/**
 * Get performance color classes (Tailwind)
 */
export const getPerformanceColorClasses = (score) => {
  if (score >= 90) return {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300',
    ring: 'ring-green-500'
  };
  if (score >= 75) return {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
    ring: 'ring-blue-500'
  };
  if (score >= 60) return {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-300',
    ring: 'ring-yellow-500'
  };
  if (score >= 40) return {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-300',
    ring: 'ring-orange-500'
  };
  return {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-300',
    ring: 'ring-red-500'
  };
};

/**
 * Get rating color classes
 */
export const getRatingColorClasses = (rating) => {
  switch (rating?.toLowerCase()) {
    case 'excellent':
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-300'
      };
    case 'good':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-300'
      };
    case 'average':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-300'
      };
    case 'below average':
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        border: 'border-orange-300'
      };
    case 'poor':
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-300'
      };
    default:
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-300'
      };
  }
};

/**
 * Get trend icon and color
 */
export const getTrendIcon = (trend) => {
  switch (trend?.toLowerCase()) {
    case 'improving':
      return { icon: '↑', color: 'text-green-600', label: 'Improving' };
    case 'declining':
      return { icon: '↓', color: 'text-red-600', label: 'Declining' };
    case 'stable':
      return { icon: '→', color: 'text-blue-600', label: 'Stable' };
    default:
      return { icon: '→', color: 'text-slate-600', label: 'Stable' };
  }
};

/**
 * Format date for display
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format period for display
 */
export const formatPeriod = (period) => {
  const periodMap = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly'
  };
  return periodMap[period?.toLowerCase()] || period;
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Get performance summary
 */
export const getPerformanceSummary = (performance) => {
  if (!performance) return null;

  const { overallScore, rating, trend, attendanceMetrics, taskMetrics, productivityMetrics } = performance;

  return {
    score: overallScore || 0,
    rating: rating || 'Average',
    trend: trend || 'stable',
    highlights: [
      {
        label: 'Attendance',
        value: `${attendanceMetrics?.attendancePercentage || 0}%`,
        score: attendanceMetrics?.attendancePercentage || 0
      },
      {
        label: 'Task Completion',
        value: `${taskMetrics?.completionRate || 0}%`,
        score: taskMetrics?.completionRate || 0
      },
      {
        label: 'Productivity',
        value: `${productivityMetrics?.productivityScore || 0}%`,
        score: productivityMetrics?.productivityScore || 0
      }
    ]
  };
};

// Export axios instance for custom requests
export { api };

export default {
  calculatePerformance,
  getPerformanceStats,
  getTopPerformers,
  getAllPerformances,
  getEmployeePerformance,
  getPerformanceTrends,
  getDepartmentPerformance,
  updatePerformanceReview,
  batchCalculatePerformance,
  getDateRangeForPeriod,
  formatPerformanceData,
  getPerformanceColor,
  getPerformanceColorClasses,
  getRatingColorClasses,
  getTrendIcon,
  formatDate,
  formatPeriod,
  calculatePercentageChange,
  getPerformanceSummary,
  api,
};