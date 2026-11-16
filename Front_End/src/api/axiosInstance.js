import axios from 'axios';

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_BASE_URL = `${configuredBaseUrl.replace(/\/+$/, '').replace(/\/api$/i, '')}/api`;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor: Auto-attach JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Unwrap ApiResponse and handle 401
axiosInstance.interceptors.response.use(
  (response) => {
    // If backend wrapped in ApiResponse { success, code, message, data }
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      response.data.data !== undefined
    ) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;
    const isAuthRoute =
      currentPath.includes('/login') ||
      currentPath.includes('/register') ||
      currentPath.includes('/forgot-password') ||
      currentPath.includes('/reset-password');

    const hasSessionToken = Boolean(localStorage.getItem('token'));
    if (status === 401 && !isAuthRoute && hasSessionToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    const backendMessage = error.response?.data?.message
      || error.response?.data?.error
      || error.response?.data?.detail;

    if (backendMessage) {
      error.message = backendMessage;
    } else if (status === 403) {
      error.message = 'You do not have permission to perform this action.';
    } else if (!error.response) {
      error.message = 'Unable to reach the store API. Check the backend server and VITE_API_BASE_URL.';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
