import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request cache to prevent duplicate requests
const requestCache = new Map();
const CACHE_DURATION = 5000; // 5 seconds

// Add request interceptor with caching and throttling
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campus_cred_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Create cache key
    const cacheKey = `${config.method}-${config.url}-${JSON.stringify(config.params || {})}`;
    
    // Check cache for GET requests
    if (config.method === 'get' && requestCache.has(cacheKey)) {
      const cached = requestCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        // Return cached promise
        return Promise.reject({ 
          __cached: true, 
          data: cached.data,
          status: 200 
        });
      } else {
        requestCache.delete(cacheKey);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors globally and cache responses
api.interceptors.response.use(
  (response) => {
    // Cache GET responses
    if (response.config.method === 'get') {
      const cacheKey = `${response.config.method}-${response.config.url}-${JSON.stringify(response.config.params || {})}`;
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    return response;
  },
  (error) => {
    // Handle cached responses
    if (error.__cached) {
      return Promise.resolve({
        data: error.data,
        status: error.status,
        cached: true
      });
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded. Please wait before making more requests.');
      // You could implement retry logic here
    }

    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('campus_cred_token');
      localStorage.removeItem('campus_cred_user');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
