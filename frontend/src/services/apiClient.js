import axios from 'axios';
import { API_URL } from '../config/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      if (error.code === 'ECONNABORTED') {
        error.message = 'Request timeout. Please check your connection.';
      } else {
        error.message = 'Network error. Please check if the server is running.';
      }
    }
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Don't redirect here to avoid infinite loops
    }
    return Promise.reject(error);
  }
);


