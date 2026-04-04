/**
 * Axios API Instance
 * -------------------
 * Centralized Axios instance with base URL and auth token interceptor.
 */

import axios from 'axios';

// In dev, `/api` is proxied to the backend (see package.json "proxy"); avoids CORS when the API is on :5000.
// Set REACT_APP_API_URL (e.g. https://api.example.com/api) for production or a custom backend URL.
const baseURL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'development' ? '/api' : 'http://localhost:5000/api');

const API = axios.create({
  baseURL,
});

const normalizeIds = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeIds);
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const normalized = {};
    Object.entries(value).forEach(([key, val]) => {
      normalized[key] = normalizeIds(val);
    });

    if (normalized._id && !normalized.id) {
      normalized.id = normalized._id;
    }

    return normalized;
  }

  return value;
};

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle global errors (like 401 Unauthorized)
API.interceptors.response.use(
  (response) => {
    response.data = normalizeIds(response.data);
    return response;
  },
  (error) => {
    // Only redirect if NOT already on a public/auth page
    const publicPages = ['/login', '/register', '/landing', '/'];
    const isPublicPage = publicPages.includes(window.location.pathname);
    
    if (error.response && error.response.status === 401 && !isPublicPage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
