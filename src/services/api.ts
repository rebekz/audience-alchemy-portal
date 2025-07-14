import axios from 'axios';
import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        await authService.refreshToken();
        
        // Update the authorization header with the new token
        const newToken = authService.getToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        await authService.logout();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    
    if (error.response?.status === 401) {
      // Handle unauthorized access - user needs to login
      await authService.logout();
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

export default api;