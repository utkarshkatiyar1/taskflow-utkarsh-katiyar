import axios, { AxiosError } from 'axios';
import { getToken, clearAuth } from '../utils/storage';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// Attach auth token to every request
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response error handling
// NOTE: skip redirect for auth endpoints — a 401 on /auth/login just means
// "wrong credentials", not "session expired". Redirecting there would wipe the
// error message before the user can read it.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isAuthRoute = error.config?.url?.includes('/auth/');
    if (error.response?.status === 401 && !isAuthRoute) {
      clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // No response at all → server is not running
    if (!error.response) {
      return 'Cannot reach the server. Make sure the API is running at http://localhost:4000';
    }
    const data = error.response?.data as { error?: string; fields?: Record<string, string> } | undefined;
    if (data?.fields) {
      return Object.values(data.fields).filter(Boolean).join(', ');
    }
    if (data?.error) return data.error;
    if (error.message) return error.message;
  }
  return 'An unexpected error occurred';
}
