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
      const response = await apiClient.get('/api/auth/me');
      setUser(response.data);
    } catch (error) {
      // Log the error for debugging and clear auth state
      console.error('fetchUser error:', error);
      // Only clear token if it's an auth error, not a network error
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      if (token && user) {
        localStorage.setItem('token', token);
        setUser(user);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      // Re-throw with a more user-friendly message
      const errorMessage = error.response?.data?.error || error.message || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
  };

  const signup = async (name, email, password, role) => {
    try {
      const response = await apiClient.post('/api/auth/signup', { name, email, password, role });
      const { token, user } = response.data;
      
      if (token && user) {
        localStorage.setItem('token', token);
        setUser(user);
      }
      
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      // Re-throw with a more user-friendly message
      const errorMessage = error.response?.data?.error || error.message || 'Signup failed. Please try again.';
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
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};