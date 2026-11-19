
import axios from "axios";

const api = axios.create({
  baseURL:
    "https://dazzling-success-production-8580d772.up.railway.app/api",
});

// Automatically attach access token.
api.interceptors.request.use(
  (config) => {
    const isLoginRequest = config.url?.includes("/auth/login");

    // Don't attach old token to login request
    if (isLoginRequest) {
      delete config.headers.Authorization;
      delete config.headers.authorization;
      return config;
    }

    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (config.data) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
