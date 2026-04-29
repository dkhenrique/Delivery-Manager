import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT if we use client-side storage (or managed via Next.js server actions/middleware)
api.interceptors.request.use(
  (config) => {
    // Note: React 19 Server Components/Actions often deal with cookies directly using next/headers.
    // If making client-side requests, ensure you handle retrieving tokens safely.
    // Typical Client approach (e.g. Zustand + LocalStorage or strictly secured Cookies):
    // const token = getAuthToken(); // custom logic
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handler
    if (error.response?.status === 401) {
      // Invalidate auth, redirect to login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
