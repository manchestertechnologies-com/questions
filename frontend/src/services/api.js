import axios from 'axios';

// Create a configured Axios instance
const API = axios.create({
  // Direct relative URL /api for proxying, or absolute path if configured in env
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to dynamically attach JWT tokens
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mantech_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept responses to catch unauthorized statuses (e.g. token expired) and sign out
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear credentials
      localStorage.removeItem('mantech_token');
      localStorage.removeItem('mantech_user');
      
      // Only redirect if not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
