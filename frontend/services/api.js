import axios from 'axios';
import { getAuthToken, removeAuthToken } from './auth';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
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
    if (error.response?.status === 401) {
      // Token expired or invalid
      removeAuthToken();
      window.location.href = '/login';
    }
    
    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

// Movies API calls
export const searchMovies = async (params) => {
  try {
    const response = await api.get('/movies', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to search movies');
  }
};

export const getMovieDetails = async (id) => {
  try {
    const response = await api.get(`/movies/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get movie details');
  }
};

export const getPopularMovies = async (params = {}) => {
  try {
    const response = await api.get('/movies/popular', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get popular movies');
  }
};

export const refreshMovieCache = async (id) => {
  try {
    const response = await api.post(`/movies/${id}/refresh`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to refresh movie cache');
  }
};

export const clearExpiredCache = async () => {
  try {
    const response = await api.delete('/movies/cache/expired');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to clear expired cache');
  }
};

export const exportMoviesCSV = async (params = {}) => {
  try {
    const response = await api.get('/movies/export/csv', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to export movies CSV');
  }
};

// Stats API calls
export const getGenreStats = async () => {
  try {
    const response = await api.get('/stats/genres');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get genre statistics');
  }
};

export const getRatingStats = async () => {
  try {
    const response = await api.get('/stats/ratings');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get rating statistics');
  }
};

export const getRuntimeStats = async () => {
  try {
    const response = await api.get('/stats/runtime');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get runtime statistics');
  }
};

export const getOverviewStats = async () => {
  try {
    const response = await api.get('/stats/overview');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get overview statistics');
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('API health check failed');
  }
};

// Utility functions for handling API responses
export const handleApiResponse = (response) => {
  if (response.success) {
    return response.data;
  } else {
    throw new Error(response.message || 'API request failed');
  }
};

export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || 'Server error occurred';
    throw new Error(message);
  } else if (error.request) {
    // Request was made but no response received
    throw new Error('No response from server. Please check your connection.');
  } else {
    // Something happened in setting up the request
    throw new Error(error.message || 'Request failed');
  }
};

// Export default axios instance for custom requests
export default api;