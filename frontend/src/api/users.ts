import { apiClient } from './client';
import type { User } from '../types';

export const usersApi = {
  list: () =>
    apiClient.get<{ users: User[] }>('/users').then((r) => r.data.users),
};
