/**
 * Axios API Instance
 * -------------------
 * Centralized Axios instance with base URL and auth token interceptor.
 */

import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

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
  (response) => response,
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
