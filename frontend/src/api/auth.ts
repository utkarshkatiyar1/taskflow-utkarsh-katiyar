import { apiClient } from './client';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../types';

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<AuthResponse>('/auth/login', credentials).then((r) => r.data),

  register: (credentials: RegisterCredentials) =>
    apiClient.post<AuthResponse>('/auth/register', credentials).then((r) => r.data),
};
