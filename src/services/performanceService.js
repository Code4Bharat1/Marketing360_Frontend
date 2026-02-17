// services/performanceService.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ==================== PERFORMANCE SERVICES ====================

/**
 * Calculate performance for an employee
 * @param {string} employeeId - Employee ID
 * @param {string} period - Time period (daily, weekly, monthly, quarterly, yearly)
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 */
export const calculatePerformance = async (employeeId, period, startDate, endDate) => {
  return apiCall('/performance/calculate', {
    method: 'POST',
    body: JSON.stringify({
      employeeId,
      period,
      startDate,
      endDate,
    }),
  });
};

/**
 * Get performance statistics
 * @param {string} period - Time period (monthly, quarterly, yearly)
 * @param {string} department - Department filter (all, engineering, management, etc.)
 */
export const getPerformanceStats = async (period = 'monthly', department = 'all') => {
  const params = new URLSearchParams({ period, department });
  return apiCall(`/performance/stats?${params}`);
};

/**
 * Get top performers
 * @param {string} period - Time period
 * @param {number} limit - Number of top performers
 * @param {string} department - Department filter
 */
export const getTopPerformers = async (period = 'monthly', limit = 5, department = 'all') => {
  const params = new URLSearchParams({ period, limit: limit.toString(), department });
  return apiCall(`/performance/top-performers?${params}`);
};

/**
 * Get all employees performance
 * @param {object} filters - Filter options
 */
export const getAllPerformances = async (filters = {}) => {
  const {
    period = 'monthly',
    department = 'all',
    rating,
    sortBy = 'overallScore',
    order = 'desc',
    page = 1,
    limit = 20,
  } = filters;

  const params = new URLSearchParams({
    period,
    department,
    sortBy,
    order,
    page: page.toString(),
    limit: limit.toString(),
  });

  if (rating) {
    params.append('rating', rating);
  }

  return apiCall(`/performance/all?${params}`);
};

/**
 * Get employee performance history
 * @param {string} employeeId - Employee ID
 * @param {object} filters - Filter options
 */
export const getEmployeePerformance = async (employeeId, filters = {}) => {
  const { period, startDate, endDate, limit = 10 } = filters;

  const params = new URLSearchParams({ limit: limit.toString() });
  
  if (period) params.append('period', period);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  return apiCall(`/performance/employee/${employeeId}?${params}`);
};

/**
 * Get department-wise performance
 * @param {string} period - Time period
 */
export const getDepartmentPerformance = async (period = 'monthly') => {
  const params = new URLSearchParams({ period });
  return apiCall(`/performance/departments?${params}`);
};

/**
 * Update performance review (manager feedback)
 * @param {string} performanceId - Performance record ID
 * @param {object} reviewData - Review data
 */
export const updatePerformanceReview = async (performanceId, reviewData) => {
  return apiCall(`/performance/review/${performanceId}`, {
    method: 'PUT',
    body: JSON.stringify(reviewData),
  });
};

/**
 * Batch calculate performance for multiple employees
 * @param {array} employeeIds - Array of employee IDs
 * @param {string} period - Time period
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 */
export const batchCalculatePerformance = async (employeeIds, period, startDate, endDate) => {
  const promises = employeeIds.map(employeeId =>
    calculatePerformance(employeeId, period, startDate, endDate)
  );
  return Promise.allSettled(promises);
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
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - now.getDay()));
      endDate = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
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
  return {
    id: performance._id,
    employeeId: performance.employee?.id || performance.employee?._id,
    employeeName: performance.employee?.name,
    employeeEmail: performance.employee?.email,
    department: performance.employee?.department,
    overallScore: performance.overallScore,
    rating: performance.rating,
    trend: performance.trend,
    attendance: performance.attendanceMetrics?.attendancePercentage || 0,
    productivity: performance.productivityMetrics?.productivityScore || 0,
    taskCompletion: performance.taskMetrics?.completionRate || 0,
    avgWorkHours: performance.attendanceMetrics?.avgWorkHours || 0,
    period: performance.period,
    startDate: performance.startDate,
    endDate: performance.endDate,
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
 * Get trend icon
 */
export const getTrendIcon = (trend) => {
  switch (trend) {
    case 'improving':
      return '↑';
    case 'declining':
      return '↓';
    case 'stable':
      return '→';
    default:
      return '→';
  }
};

export default {
  calculatePerformance,
  getPerformanceStats,
  getTopPerformers,
  getAllPerformances,
  getEmployeePerformance,
  getDepartmentPerformance,
  updatePerformanceReview,
  batchCalculatePerformance,
  getDateRangeForPeriod,
  formatPerformanceData,
  getPerformanceColor,
  getTrendIcon,
};