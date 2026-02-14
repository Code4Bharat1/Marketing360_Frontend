import axios from 'axios';

// Base URL for API
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/';
      } else if (status === 403) {
        // Forbidden
        console.error('Access denied:', data.message);
      } else if (status === 500) {
        // Server error
        console.error('Server error:', data.message);
      }
      
      return Promise.reject(data);
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server');
      return Promise.reject({ message: 'No response from server' });
    } else {
      // Something else happened
      console.error('Request error:', error.message);
      return Promise.reject({ message: error.message });
    }
  }
);

export default api;