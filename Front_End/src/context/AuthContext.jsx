import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

const getAuthErrorMessage = (err, fallback) => {
  const body = err.response?.data;
  const backendMessage = body?.message || body?.error || body?.detail;
  if (backendMessage) return backendMessage;
  if (!err.response) {
    return 'Cannot connect to the backend. Start the Spring Boot server and check VITE_API_BASE_URL.';
  }
  return err.message || fallback;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Apply dark mode on mount and state change
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Restore user session on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login handler
  const login = async (credentials) => {
    try {
      const data = await authApi.login(credentials);
      const accessToken = data.accessToken || data.token;
      const userData = {
        id: data.id,
        email: data.email,
        phone: data.phone,
        createAt: data.createAt,
        profile: data.profile,
        roles: data.roles || [],
        permissions: data.permission || data.permissions || [],
      };

      if (accessToken) {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(accessToken);
        setUser(userData);
      }
      return data;
    } catch (err) {
      throw new Error(getAuthErrorMessage(err, 'Login failed. Please check your credentials.'));
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const data = await authApi.register(userData);
      return data;
    } catch (err) {
      throw new Error(getAuthErrorMessage(err, 'Registration failed.'));
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Signed out successfully');
  };

  // Role checks
  const isAdmin = Boolean(
    user?.roles?.some((r) => {
      const clean = String(r).toUpperCase().replace(/^ROLE_/, '');
      return clean === 'ADMIN';
    }) || user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN'
  );

  const hasRole = (roleName) => {
    if (!user || !user.roles) return false;
    const target = roleName.toUpperCase().replace(/^ROLE_/, '');
    return user.roles.some((r) => String(r).toUpperCase().replace(/^ROLE_/, '') === target);
  };

  const hasPermission = (permName) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permName);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        hasRole,
        hasPermission,
        login,
        register,
        logout,
        signOut: logout,
        darkMode,
        toggleDarkMode,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
