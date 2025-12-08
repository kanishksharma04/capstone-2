/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      // Use non-/api route so it works with both baseURL = 'http://localhost:3001'
      // and baseURL = 'http://localhost:3001/api'
      const response = await apiClient.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('fetchUser error:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Same idea: hit /auth/login instead of /api/auth/login
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response.data;

      if (token && user) {
        localStorage.setItem('token', token);
        setUser(user);
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
  };

  const signup = async (name, email, password, role) => {
    try {
      // Same here: /auth/signup instead of /api/auth/signup
      const response = await apiClient.post('/auth/signup', {
        name,
        email,
        password,
        role,
      });
      const { token, user } = response.data;

      if (token && user) {
        localStorage.setItem('token', token);
        setUser(user);
      }

      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Signup failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
