import axiosInstance from './axiosInstance';

export const authApi = {
  /**
   * Login user with identifier (email or phone) and password
   * DTO: UserLoginRequest -> returns UserLoginResponse
   */
  login: async ({ identifier, password }) => {
    return await axiosInstance.post('/auth/login', { identifier, password });
  },

  /**
   * Register new user
   * DTO: UserRegisterRequest -> returns UserRegisterResponse
   */
  register: async (userData) => {
    return await axiosInstance.post('/auth/register', userData);
  },

  /**
   * Request password reset instructions
   * DTO: ForgotPasswordRequest -> returns message + optional devResetToken
   */
  forgotPassword: async ({ email }) => {
    return await axiosInstance.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token, newPassword, confirmPassword
   * DTO: ResetPasswordRequest -> returns success message
   */
  resetPassword: async ({ token, newPassword, confirmPassword }) => {
    return await axiosInstance.post('/auth/reset-password', {
      token,
      newPassword,
      confirmPassword,
    });
  },
};

export default authApi;

