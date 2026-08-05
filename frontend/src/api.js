import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true,
});

// Helper to set/remove token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('utonga_staff_token', token);
    api.defaults.headers.common.Authorization = `Token ${token}`;
  } else {
    localStorage.removeItem('utonga_staff_token');
    delete api.defaults.headers.common.Authorization;
  }
};

// Request Interceptor: Ensure token is always current from storage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('utonga_staff_token');

  if (token) {
    config.headers.Authorization = `Token ${token}`;
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
  }

  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Handle session expiration (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 and we are trying to access a protected admin route
    if (error.response?.status === 401 && window.location.pathname.startsWith('/staff/')) {
      console.warn('Session expired or unauthorized. Redirecting to login...');
      localStorage.removeItem('utonga_staff_token');
      localStorage.removeItem('utonga_staff_user');

      // Only redirect if not already on the login page to avoid loops
      if (window.location.pathname !== '/staff/login') {
        window.location.href = '/staff/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
