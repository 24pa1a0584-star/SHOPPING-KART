import axios from 'axios';
import { getGuestSessionId } from '../lib/utils';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach guest session ID header
api.interceptors.request.use((config) => {
  const guestSessionId = getGuestSessionId();
  if (guestSessionId) {
    config.headers['x-guest-session-id'] = guestSessionId;
  }
  return config;
});

// Response interceptor to format error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);
