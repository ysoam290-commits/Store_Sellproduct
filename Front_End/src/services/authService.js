import axiosInstance from '../api/axiosInstance';

export const authService = {
  login: (credentials) => axiosInstance.post('/auth/login', credentials),

  register: (userData) => axiosInstance.post('/auth/register', userData),

  forgotPassword: (data) => axiosInstance.post('/auth/forgot-password', data),

  resetPassword: (data) => axiosInstance.post('/auth/reset-password', data),
};
